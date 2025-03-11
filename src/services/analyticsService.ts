
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Constants
const STORAGE_KEYS = {
  ANONYMOUS_ID: 'gyma_anonymous_id',
  SESSION_ID: 'gyma_session_id',
  SESSION_START: 'gyma_session_start',
};

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Analytics Service to track app usage
 */
export class AnalyticsService {
  private anonymousId: string;
  private sessionId: string;
  private sessionStartTime: number;
  private heartbeatInterval: number | null = null;
  private deviceInfo: DeviceInfo;
  private lastPingTime: number = Date.now();
  
  constructor() {
    // Initialize anonymous ID (persists across sessions)
    this.anonymousId = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID) || uuidv4();
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, this.anonymousId);
    
    // Initialize session (temporary for current visit)
    this.sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID) || uuidv4();
    this.sessionStartTime = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_START) || Date.now().toString(), 10);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSION_START, this.sessionStartTime.toString());
    
    // Get device information
    this.deviceInfo = this.getDeviceInfo();
    
    // Start tracking session
    this.startSessionTracking();
  }
  
  /**
   * Start a new user session or continue existing one
   */
  public async startSession(isFirstVisit = false) {
    try {
      // Get user info if available
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      
      // Create a session record
      const { error } = await supabase.from('analytics_sessions').insert({
        session_id: this.sessionId,
        anonymous_id: this.anonymousId,
        user_id: userId || null,
        device_type: this.deviceInfo.deviceType,
        os: this.deviceInfo.os,
        browser: this.deviceInfo.browser,
        country: null, // Will be determined server-side
        started_at: new Date(this.sessionStartTime).toISOString(),
        is_first_visit: isFirstVisit,
      });
      
      if (error) {
        console.error('Failed to record session start:', error);
      } else {
        // Get the country information via edge function
        this.getGeoLocation();
      }
    } catch (error) {
      console.error('Error starting analytics session:', error);
    }
  }
  
  /**
   * Track a user event
   */
  public async trackEvent(eventName: string, properties = {}) {
    try {
      // Get user info if available
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      
      // Record the event
      const { error } = await supabase.from('analytics_events').insert({
        session_id: this.sessionId,
        anonymous_id: this.anonymousId,
        user_id: userId || null,
        event_name: eventName,
        event_properties: properties,
      });
      
      if (error) {
        console.error(`Failed to track event "${eventName}":`, error);
      }
    } catch (error) {
      console.error(`Error tracking event "${eventName}":`, error);
    }
  }
  
  /**
   * End the current session and record duration
   */
  public async endSession() {
    try {
      const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000); // Duration in seconds
      
      // Get user info if available
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      
      // Update the session with end time and duration
      const { error } = await supabase
        .from('analytics_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration: sessionDuration,
        })
        .eq('session_id', this.sessionId);
      
      if (error) {
        console.error('Failed to end session:', error);
      }
      
      // Clean up
      if (this.heartbeatInterval) {
        window.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    } catch (error) {
      console.error('Error ending analytics session:', error);
    }
  }
  
  /**
   * Get geolocation data from IP address using edge function
   */
  private async getGeoLocation() {
    try {
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;
      
      // Call the edge function to get geolocation
      const response = await supabase.functions.invoke('geo-locate', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-anonymous-id': this.anonymousId
        }
      });
      
      if (response.error) {
        console.error('Error invoking geo-locate function:', response.error);
      }
    } catch (error) {
      console.error('Failed to get geolocation:', error);
    }
  }
  
  /**
   * Record heartbeat to update session duration
   */
  private async recordHeartbeat() {
    const now = Date.now();
    const timeSinceLastPing = now - this.lastPingTime;
    
    // If more than the session timeout has passed, create a new session
    if (timeSinceLastPing > SESSION_TIMEOUT_MS) {
      await this.endSession();
      this.sessionId = uuidv4();
      this.sessionStartTime = now;
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_START, this.sessionStartTime.toString());
      await this.startSession();
    }
    
    this.lastPingTime = now;
  }
  
  /**
   * Start tracking the user session
   */
  private startSessionTracking() {
    // Set up heartbeat to track session duration
    this.heartbeatInterval = window.setInterval(() => {
      this.recordHeartbeat();
    }, 60000); // Heartbeat every minute
    
    // Set up events for session end
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
    
    // Record activity
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.endSession();
      } else if (document.visibilityState === 'visible') {
        this.recordHeartbeat();
      }
    });
  }
  
  /**
   * Get device and browser information
   */
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    
    let deviceType = 'desktop';
    let os = 'unknown';
    let browser = 'unknown';
    
    // Detect device type
    if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent)) {
      deviceType = 'mobile';
      
      if (/iPad|Tablet|Pad/i.test(userAgent)) {
        deviceType = 'tablet';
      }
    }
    
    // Detect OS
    if (/Windows/i.test(userAgent)) {
      os = 'Windows';
    } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
      os = 'macOS';
    } else if (/Linux/i.test(userAgent)) {
      os = 'Linux';
    } else if (/Android/i.test(userAgent)) {
      os = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      os = 'iOS';
    }
    
    // Detect browser
    if (/Chrome/i.test(userAgent) && !/Chromium|Edge|OPR|Edg/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/Safari/i.test(userAgent) && !/Chrome|Chromium|Edge|OPR|Edg/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/Edge|Edg/i.test(userAgent)) {
      browser = 'Edge';
    } else if (/OPR/i.test(userAgent)) {
      browser = 'Opera';
    } else if (/MSIE|Trident/i.test(userAgent)) {
      browser = 'Internet Explorer';
    }
    
    return {
      deviceType,
      os,
      browser
    };
  }
}

export interface DeviceInfo {
  deviceType: string;
  os: string;
  browser: string;
}

// Create a singleton instance
export const analyticsService = new AnalyticsService();
