'use client';

import { useCallback, useState, useEffect } from 'react';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  weight: string;
  activityLevel: string;
}

export default function Home() {
  const [activePage, setActivePage] = useState('home');
  const [waterIntake, setWaterIntake] = useState(0);
  const dailyGoal = 1000; // Athlete daily goal: 1000ml
  const [showAlert, setShowAlert] = useState(true);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    weight: '',
    activityLevel: 'moderate'
  });
  const [formError, setFormError] = useState('');

  // Emoji cycling for Stay Hydrated
  const hydrationEmojis = ['💧', '🥤', '💦', '🚰', '🧊', '🌊'];
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const [emojiAnimating, setEmojiAnimating] = useState(false);

  // Time-based greeting
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };
    
    updateGreeting();
    const greetingInterval = setInterval(updateGreeting, 60000); // Check every minute
    return () => clearInterval(greetingInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiAnimating(true);
      setTimeout(() => {
        setCurrentEmojiIndex((prev) => (prev + 1) % hydrationEmojis.length);
      }, 250);
      setTimeout(() => {
        setEmojiAnimating(false);
      }, 500);
    }, 2500);
    return () => clearInterval(interval);
  }, [hydrationEmojis.length]);

  // Activity log state - tracks real events
  interface ActivityItem {
    id: number;
    time: string;
    title: string;
    details: string;
  }
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [activityIdCounter, setActivityIdCounter] = useState(0);

  // Add activity to log
  const addActivity = useCallback((title: string, details: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = 'Today, ' + timeStr;
    
    setActivityLog(prev => [{
      id: activityIdCounter,
      time: dateStr,
      title,
      details
    }, ...prev].slice(0, 10)); // Keep last 10 activities
    setActivityIdCounter(prev => prev + 1);
  }, [activityIdCounter]);

  // Connected devices state
  const [connectedDevices, setConnectedDevices] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    status: string;
    battery: number;
  }>>([]);
  const [waitingDots, setWaitingDots] = useState('');

  // Animated dots for "Waiting for device..."
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Handle sign up
  const handleSignUp = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    // Save user data and log in
    setUserData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      age: formData.age || '25',
      weight: formData.weight || '70',
      activityLevel: formData.activityLevel
    });
    setIsLoggedIn(true);
    setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', age: '', weight: '', activityLevel: 'moderate' });
  };

  // Handle login
  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      setFormError('Please enter email and password');
      return;
    }
    
    // For demo purposes, just log in with default data if no user exists
    if (!userData) {
      setUserData({
        firstName: 'Athlete',
        lastName: 'User',
        email: formData.email,
        age: '25',
        weight: '70',
        activityLevel: 'moderate'
      });
    }
    setIsLoggedIn(true);
    setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', age: '', weight: '', activityLevel: 'moderate' });
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthMode('login');
  };

// Flow sensor state - starts empty, filled when sensor connects
  const [sensorConnected, setSensorConnected] = useState(false);
  const [flowData, setFlowData] = useState<Array<{ time: number; flow: number; ml: number }>>([]);
  const [totalFlowIntake, setTotalFlowIntake] = useState(0);
  
  // Flow-based hydration tracking
  const flowPercentage = Math.min(100, Math.round((totalFlowIntake / dailyGoal) * 100));
  const flowRemaining = Math.max(0, dailyGoal - totalFlowIntake);

  // Function to simulate flow sensor data (for testing - replace with real sensor integration)
  const addFlowReading = useCallback((flowRate: number, mlConsumed: number) => {
    if (!sensorConnected) return;
    
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    
    setFlowData(prev => [...prev, { time: hours, flow: flowRate, ml: mlConsumed }]);
    setTotalFlowIntake(prev => {
      const newTotal = Math.min(dailyGoal, prev + mlConsumed);
      
      // Log activity for flow detection
      addActivity('Flow Detected', `Sensor detected ${mlConsumed}ml water flow`);
      
      // Check if goal reached
      if (newTotal >= dailyGoal && prev < dailyGoal) {
        setTimeout(() => {
          addActivity('Goal Reached!', `Flow sensor tracked ${dailyGoal}ml - Daily goal complete!`);
        }, 100);
      }
      
      return newTotal;
    });
  }, [sensorConnected, dailyGoal, addActivity]);

  // Connect flow sensor
  const connectFlowSensor = useCallback((deviceName: string) => {
    setSensorConnected(true);
    setFlowData([]);
    setTotalFlowIntake(0);
    addActivity('Sensor Connected', `${deviceName} flow sensor is now active`);
  }, [addActivity]);

  // Disconnect flow sensor
  const disconnectFlowSensor = useCallback(() => {
    setSensorConnected(false);
    addActivity('Sensor Disconnected', 'Flow sensor has been disconnected');
  }, [addActivity]);

  const addWater = useCallback((amount: number) => {
    setWaterIntake((prev) => {
      const newValue = prev + amount;
      // Cap at 1000ml max and 0ml min
      return Math.max(0, Math.min(dailyGoal, newValue));
    });
  }, [dailyGoal]);

  const percentage = Math.round((waterIntake / dailyGoal) * 100);
  const remaining = Math.max(0, dailyGoal - waterIntake);

// Generate chart points for flow sensor visualization
  const generateFlowChartPoints = () => {
    const maxFlow = 100; // Max flow rate for visualization
    const chartWidth = 560;
    const chartHeight = 110;
    const startX = 40;
    const startY = 10;
    
    // Return empty if no data
    if (flowData.length === 0) {
      return { linePoints: '', areaPolygon: '' };
    }
    
    const linePoints: string[] = [];
    const areaPoints: string[] = [];
    
    flowData.forEach((data) => {
      const xPosition = startX + (data.time / 24) * chartWidth;
      const yPosition = startY + chartHeight - (data.flow / maxFlow) * chartHeight;
      linePoints.push(`${xPosition},${yPosition}`);
      areaPoints.push(`${xPosition},${yPosition}`);
    });
    
    // Create area polygon (add bottom points for fill)
    let areaPolygon = areaPoints.join(' ');
    if (areaPoints.length > 0) {
      const lastX = startX + (flowData[flowData.length - 1].time / 24) * chartWidth;
      const firstX = startX + (flowData[0].time / 24) * chartWidth;
      areaPolygon += ` ${lastX},${startY + chartHeight} ${firstX},${startY + chartHeight}`;
    }
    
    return { linePoints: linePoints.join(' '), areaPolygon };
  };
  
  const { linePoints, areaPolygon } = generateFlowChartPoints();

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --background: #F5E4CF;
          --foreground: #1a1a2e;
          --card: #ffffff;
          --card-foreground: #1a1a2e;
          --primary: #275CCC;
          --primary-foreground: #F5E4CF;
          --secondary: #e8d4bd;
          --secondary-foreground: #275CCC;
          --muted-foreground: #6b7280;
          --border: #d4c4ad;
          --water-light: #a8d4f5;
          --water-medium: #5ba8e6;
          --water-dark: #275CCC;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: var(--background);
          color: var(--foreground);
          overflow-x: hidden;
        }

        .container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        main {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 100px;
        }

        .content {
          padding: 32px 24px;
        }

        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 12px 0;
          border-bottom: 2px solid rgba(39, 92, 204, 0.1);
        }

        .nav-left {
          display: flex;
          gap: 8px;
        }

        .nav-button {
          background: var(--card);
          border: 2px solid transparent;
          padding: 10px 20px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted-foreground);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .nav-button:hover {
          background-color: var(--primary);
          color: var(--primary-foreground);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(39, 92, 204, 0.2);
        }

        .nav-button.active {
          background-color: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
          box-shadow: 0 6px 16px rgba(39, 92, 204, 0.3);
        }

        .header {
          margin-bottom: 32px;
        }

        .header-subtitle {
          font-size: 14px;
          color: var(--muted-foreground);
          margin-bottom: 4px;
        }

        .header-title {
          font-size: 24px;
          font-weight: bold;
          color: var(--foreground);
        }

        .hydration-emoji {
          display: inline-block;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        }

        .hydration-emoji.animating {
          animation: emojiSwap 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes emojiSwap {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          40% {
            transform: translateY(-8px) scale(1.1);
            opacity: 0;
          }
          60% {
            transform: translateY(8px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .waiting-dots {
          display: inline-block;
          min-width: 24px;
          text-align: left;
        }

        .alert {
          display: flex;
          gap: 12px;
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 16px;
          background-color: rgba(39, 92, 204, 0.1);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .alert-message {
          font-size: 14px;
          color: var(--muted-foreground);
        }

        .alert-close {
          background: none;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          font-size: 24px;
          font-weight: bold;
          transition: color 0.2s;
        }

        .alert-close:hover {
          color: var(--foreground);
        }

        .hidden {
          display: none;
        }

        .water-card {
          border-radius: 24px;
          background: linear-gradient(to bottom, #d4edfc, #a8d4f5);
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .water-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .water-card-left {
          flex: 1;
        }

        .water-card-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .water-card-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--foreground);
        }

        .water-card-right {
          text-align: right;
        }

        .water-card-goal-label {
          font-size: 14px;
          color: var(--muted-foreground);
          margin-bottom: 4px;
        }

        .water-card-goal {
          font-weight: 600;
          color: var(--foreground);
        }

        .glass-container {
          position: relative;
          width: 128px;
          height: 208px;
          margin: 0 auto 24px;
          border-radius: 16px;
          border: 4px solid rgba(255, 255, 255, 0.7);
          background-color: rgba(255, 255, 255, 0.3);
          box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .glass-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to bottom, #5ba8e6, #275CCC);
          transition: height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .glass-wave {
          position: absolute;
          top: -2px;
          left: 0;
          width: 100%;
          height: 15px;
        }

        .glass-percentage {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          z-index: 2;
        }

        .bubble {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          left: 12px;
          animation: float 2s ease-in-out infinite;
        }

        .bubble.bubble1 {
          width: 8px;
          height: 8px;
          bottom: 8px;
          animation-duration: 2s;
        }

        .bubble.bubble2 {
          width: 6px;
          height: 6px;
          bottom: 16px;
          right: 16px;
          animation-duration: 2.5s;
          animation-delay: 0.5s;
        }

        .bubble.bubble3 {
          width: 4px;
          height: 4px;
          bottom: 24px;
          left: 20px;
          animation-duration: 1.8s;
          animation-delay: 0.3s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.6;
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-5px) translateY(2px);
          }
        }

        .chart-card {
          border-radius: 24px;
          background: linear-gradient(to bottom, #d4edfc, #a8d4f5);
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .chart-info {
          flex: 1;
          min-width: 200px;
        }

        .chart-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chart-title {
          font-size: 24px;
          font-weight: bold;
          color: var(--foreground);
          margin-bottom: 8px;
        }

        .chart-time {
          font-size: 12px;
          color: var(--muted-foreground);
          font-weight: 500;
        }

        .chart-consumed {
          text-align: right;
        }

        .chart-consumed-label {
          font-size: 12px;
          color: var(--muted-foreground);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .chart-consumed-value {
          font-weight: bold;
          color: var(--foreground);
          font-size: 24px;
        }

        .chart-container {
          position: relative;
          width: 100%;
          height: 280px;
          margin-bottom: 0;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          padding: 20px 20px 40px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.3);
          overflow: visible;
        }

        .chart-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .button-group {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
        }

        .btn {
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: scale(0.95);
        }

        .btn-minus {
          width: 48px;
          height: 48px;
          background-color: rgba(255, 255, 255, 0.6);
          color: var(--primary);
          font-size: 24px;
          font-weight: bold;
        }

        .btn-add {
          width: 56px;
          height: 56px;
          background-color: var(--primary);
          color: var(--primary-foreground);
          font-size: 24px;
          font-weight: bold;
        }

        .btn-add100 {
          width: 48px;
          height: 48px;
          background-color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 24px;
        }

        .stat-card {
          border-radius: 16px;
          background-color: var(--card);
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .stat-header {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          align-items: center;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.red {
          background-color: #fee2e2;
          color: #ef4444;
        }

        .stat-icon.orange {
          background-color: #fed7aa;
          color: #f59e0b;
        }

        .stat-label {
          font-size: 14px;
          color: var(--muted-foreground);
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .stat-unit {
          font-size: 13px;
          color: var(--muted-foreground);
        }

        .summary-card {
          border-radius: 16px;
          background-color: var(--card);
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-top: 24px;
        }

        .card-title {
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 16px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          text-align: center;
        }

        .summary-item-value {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .summary-item-label {
          font-size: 11px;
          color: var(--muted-foreground);
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 16px;
          margin-top: 24px;
        }

        .devices-container {
          margin-bottom: 24px;
        }

        .device-card {
          border-radius: 16px;
          background-color: var(--secondary);
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .device-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .device-info {
          flex: 1;
        }

        .device-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .device-status {
          font-size: 12px;
          color: var(--muted-foreground);
        }

        .device-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .battery {
          font-size: 12px;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .connected-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
        }

        .connected-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #10b981;
        }

        .page-container {
          display: none;
          animation: fadeIn 0.3s ease-in;
        }

        .page-container.active {
          display: block;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .activity-card {
          background: var(--card);
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border-left: 4px solid var(--primary);
        }

        .activity-time {
          font-size: 12px;
          color: var(--muted-foreground);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .activity-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .activity-details {
          font-size: 14px;
          color: var(--muted-foreground);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--card);
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--water-medium));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          flex-shrink: 0;
        }

        .profile-info h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .profile-info p {
          font-size: 14px;
          color: var(--muted-foreground);
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: var(--card);
          padding: 16px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .stat-box-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary);
          margin-bottom: 4px;
        }

.stat-box-label {
  font-size: 12px;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  }

  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 32px;
    background: var(--card);
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .auth-tabs {
    display: flex;
    margin-bottom: 24px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    padding: 4px;
  }

  .auth-tab {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    font-size: 14px;
    font-weight: 600;
    color: var(--muted-foreground);
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .auth-tab.active {
    background: var(--primary);
    color: white;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-row {
    display: flex;
    gap: 12px;
  }

  .form-row .form-group {
    flex: 1;
  }

  .form-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--foreground);
  }

  .form-input {
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    font-size: 14px;
    background: #ffffff;
    color: #333333;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .form-input::placeholder {
    color: #999999;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(39, 92, 204, 0.1);
  }

  .form-select {
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    font-size: 14px;
    background: #ffffff;
    color: #333333;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
  }

  .form-select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(39, 92, 204, 0.1);
  }

  .form-error {
    color: #e74c3c;
    font-size: 13px;
    text-align: center;
    padding: 8px;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 8px;
  }

  .auth-btn {
    padding: 14px 24px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(39, 92, 204, 0.3);
  }

  .logout-btn {
    padding: 12px 24px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 16px;
  }

  .logout-btn:hover {
    background: #c0392b;
  }

  .profile-logged-in {
    text-align: center;
  }

  .profile-welcome {
    font-size: 14px;
    color: var(--muted-foreground);
    margin-bottom: 8px;
  }

        @media (max-width: 640px) {
          .content {
            padding: 24px 16px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            text-align: left;
            gap: 12px;
          }

          .device-meta {
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }

          .nav-left {
            gap: 4px;
          }

          .nav-button {
            padding: 8px 16px;
            font-size: 13px;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      <div className="container">
        <main>
          <div className="content">
            <div className="top-nav">
              <div className="nav-left">
                <button 
                  className={`nav-button ${activePage === 'home' ? 'active' : ''}`}
                  onClick={() => setActivePage('home')}
                >
                  📊 Home
                </button>
              </div>
              <div className="nav-left">
                <button 
                  className={`nav-button ${activePage === 'activity' ? 'active' : ''}`}
                  onClick={() => setActivePage('activity')}
                >
                  ⚡ Activity
                </button>
                <button 
                  className={`nav-button ${activePage === 'profile' ? 'active' : ''}`}
                  onClick={() => setActivePage('profile')}
                >
                  👤 Profile
                </button>
              </div>
            </div>

<div className={`page-container ${activePage === 'home' ? 'active' : ''}`}>
  <div className="header">
  <p className="header-subtitle">{greeting}, {isLoggedIn && userData ? userData.firstName : 'User'}</p>
  <h1 className="header-title">Stay Hydrated <span className={`hydration-emoji ${emojiAnimating ? 'animating' : ''}`}>{hydrationEmojis[currentEmojiIndex]}</span></h1>
  </div>

            {showAlert && (
              <div className="alert">
                <div className="alert-icon">{sensorConnected ? '💧' : '📡'}</div>
                <div className="alert-content">
                  <div className="alert-title">
                    {!sensorConnected 
                      ? 'Flow Sensor Status' 
                      : flowRemaining > 0 
                        ? 'Keep Drinking!' 
                        : 'Goal Reached!'}
                  </div>
<div className="alert-message">
  {!sensorConnected
  ? 'Awaiting flow sensor connection...'
  : flowRemaining > 0
  ? `Flow detected: ${totalFlowIntake}ml consumed. ${flowRemaining}ml remaining.`
  : `Excellent! Flow sensor tracked ${totalFlowIntake}ml today!`}
  </div>
                </div>
                <button className="alert-close" onClick={() => setShowAlert(false)}>×</button>
              </div>
            )}

            <div className="water-card">
              <div className="water-card-header">
                <div className="water-card-left">
                  <p className="water-card-label">Water Intake</p>
                  <p className="water-card-value">{waterIntake}ml</p>
                </div>
                <div className="water-card-right">
                  <p className="water-card-goal-label">Goal</p>
                  <p className="water-card-goal">{dailyGoal}ml</p>
                </div>
              </div>

              <div className="glass-container">
                <div className="glass-fill" style={{height: `${percentage}%`}}>
                  <svg className="glass-wave" viewBox="0 0 100 15" preserveAspectRatio="none">
                    <path d="M0,8 Q25,0 50,8 T100,8 L100,15 L0,15 Z" fill="#5ba8e6" style={{animation: 'wave 2s ease-in-out infinite'}}/>
                  </svg>
                  <div className="bubble bubble1"></div>
                  <div className="bubble bubble2"></div>
                  <div className="bubble bubble3"></div>
                </div>
                <div className="glass-percentage">{percentage}%</div>
              </div>

              <div className="button-group">
                <button className="btn btn-minus" onClick={() => addWater(-100)}>−</button>
                <button className="btn btn-add" onClick={() => addWater(250)}>+</button>
                <button className="btn btn-add100" onClick={() => addWater(100)}>+100</button>
              </div>
            </div>

<div className="chart-card">
  <div className="chart-header">
  <div className="chart-info">
  <p className="chart-label">Flow Rate Monitor</p>
  <p className="chart-title">{sensorConnected ? 'Real-time Water Flow' : 'No Sensor Connected'}</p>
  <p className="chart-time">{sensorConnected ? `${flowData.length} readings today` : 'Connect a flow sensor to track'}</p>
  </div>
  <div className="chart-consumed">
  <p className="chart-consumed-label">{sensorConnected ? 'Total Tracked' : 'Current Flow'}</p>
  <p className="chart-consumed-value">{sensorConnected ? `${totalFlowIntake}ml` : '--'}</p>
  <p style={{fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px'}}>{sensorConnected ? `${flowPercentage}% of goal` : 'Awaiting sensor'}</p>
  </div>
  </div>
  
  <div className="chart-container">
  <svg className="chart-svg" viewBox="0 0 600 150" preserveAspectRatio="none">
  <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
  <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
  <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
  
  <text x="5" y="20" fontSize="10" fill="var(--muted-foreground)" dy="0.3em">100</text>
  <text x="5" y="50" fontSize="10" fill="var(--muted-foreground)" dy="0.3em">75</text>
  <text x="5" y="80" fontSize="10" fill="var(--muted-foreground)" dy="0.3em">50</text>
  <text x="5" y="110" fontSize="10" fill="var(--muted-foreground)" dy="0.3em">25</text>
  <text x="5" y="135" fontSize="10" fill="var(--muted-foreground)" dy="0.3em">ml/s</text>
  
  <line x1="40" y1="10" x2="40" y2="120" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
  <line x1="40" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
  
  <defs>
  <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" style={{stopColor: '#5ba8e6', stopOpacity: 0.4}} />
  <stop offset="100%" style={{stopColor: '#275CCC', stopOpacity: 0.05}} />
  </linearGradient>
  </defs>
  
  {/* Show empty state or chart data */}
  {!sensorConnected || flowData.length === 0 ? (
    <text x="300" y="70" fontSize="14" fill="var(--muted-foreground)" textAnchor="middle">
      {sensorConnected ? 'Waiting for flow data...' : 'Connect flow sensor to see data'}
    </text>
  ) : (
    <>
      <polygon points={areaPolygon} fill="url(#chart-gradient)"/>
      <polyline points={linePoints} fill="none" stroke="#275CCC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {flowData.map((data, index) => {
        const xPosition = 40 + (data.time / 24) * 560;
        const yPosition = 10 + 110 - (data.flow / 100) * 110;
        return (
          <circle
            key={index}
            cx={xPosition}
            cy={yPosition}
            r="4"
            fill="#275CCC"
            stroke="white"
            strokeWidth="2"
          />
        );
      })}
    </>
  )}
  
  <text x="50" y="140" fontSize="10" fill="var(--muted-foreground)" textAnchor="start">0h</text>
  <text x="150" y="140" fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">4h</text>
  <text x="250" y="140" fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">8h</text>
  <text x="350" y="140" fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">12h</text>
  <text x="450" y="140" fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">16h</text>
  <text x="550" y="140" fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">20h</text>
  </svg>
  </div>
            </div>

            <div className="grid-2">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon red">❤️</div>
                  <span className="stat-label">Heart Rate</span>
                </div>
                <p className="stat-value" id="heart-rate">118</p>
                <p className="stat-unit">BPM</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon orange">🌡️</div>
                  <span className="stat-label">Body Temp</span>
                </div>
                <p className="stat-value" id="temp-value">36.8</p>
                <p className="stat-unit">°C</p>
              </div>
            </div>

            <div className="summary-card">
              <h3 className="card-title">Today&apos;s Summary (Flow Sensor)</h3>
              <div className="summary-grid">
                <div>
                  <p className="summary-item-value">{sensorConnected ? `${flowPercentage}%` : '--'}</p>
                  <p className="summary-item-label">Hydration</p>
                </div>
                <div>
<p className="summary-item-value">{sensorConnected ? `${totalFlowIntake}ml` : '--'}</p>
  <p className="summary-item-label">Flow Detected</p>
                </div>
                <div>
                  <p className="summary-item-value">{sensorConnected ? `${flowRemaining}ml` : '--'}</p>
                  <p className="summary-item-label">Remaining</p>
                </div>
              </div>
              {!sensorConnected && (
                <p style={{textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '12px'}}>
                  Connect flow sensor to track actual consumption
                </p>
              )}
            </div>

<h2 className="section-title">Connected Devices</h2>
  <div className="devices-container">
  {connectedDevices.length === 0 ? (
    <div className="device-card" style={{justifyContent: 'center', padding: '32px 16px'}}>
      <div className="device-info" style={{textAlign: 'center'}}>
        <p className="device-name" style={{color: 'var(--muted-foreground)'}}>
          Waiting for a device<span className="waiting-dots">{waitingDots}</span>
        </p>
        <p className="device-status" style={{marginTop: '8px'}}>No devices connected yet</p>
      </div>
    </div>
  ) : (
    connectedDevices.map((device) => (
      <div className="device-card" key={device.id}>
        <div className="device-icon">{device.icon}</div>
        <div className="device-info">
          <p className="device-name">{device.name}</p>
          <p className="device-status">{device.status}</p>
        </div>
        <div className="device-meta">
          <span className="battery">🔋 {device.battery}%</span>
          <div className="connected-badge">
            <div className="connected-dot"></div>
            Connected
          </div>
        </div>
      </div>
    ))
  )}
  </div>
            </div>

            {/* Activity Page */}
            <div className={`page-container ${activePage === 'activity' ? 'active' : ''}`}>
              <div className="header">
                <p className="header-subtitle">Your Daily Activities</p>
                <h1 className="header-title">Activity Log</h1>
              </div>

              <div className="activity-grid">
                {activityLog.length === 0 ? (
                  <div className="activity-card" style={{textAlign: 'center', padding: '32px 16px'}}>
                    <div className="activity-title" style={{color: 'var(--muted-foreground)'}}>No activities yet</div>
                    <div className="activity-details">Start tracking your water intake on the Home page</div>
                  </div>
                ) : (
                  activityLog.map((activity) => (
                    <div className="activity-card" key={activity.id}>
                      <div className="activity-time">{activity.time}</div>
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-details">{activity.details}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="summary-card">
                <h3 className="card-title">Flow Sensor Summary</h3>
                <div className="summary-grid">
                  <div>
                    <p className="summary-item-value">{sensorConnected ? flowData.filter(d => d.flow > 0).length : '--'}</p>
                    <p className="summary-item-label">Flow Events</p>
                  </div>
                  <div>
<p className="summary-item-value">{sensorConnected ? `${totalFlowIntake}ml` : '--'}</p>
  <p className="summary-item-label">Total Volume</p>
                  </div>
                  <div>
                    <p className="summary-item-value">{dailyGoal}ml</p>
                    <p className="summary-item-label">Daily Goal</p>
                  </div>
                </div>
                {!sensorConnected && (
                  <p style={{textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '12px'}}>
                    Awaiting sensor connection
                  </p>
                )}
              </div>
            </div>

            {/* Profile Page */}
            <div className={`page-container ${activePage === 'profile' ? 'active' : ''}`}>
              {!isLoggedIn ? (
                /* Login / Sign Up Form */
                <div className="auth-container">
                  <div className="auth-tabs">
                    <button 
                      className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                      onClick={() => { setAuthMode('login'); setFormError(''); }}
                    >
                      Log In
                    </button>
                    <button 
                      className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                      onClick={() => { setAuthMode('signup'); setFormError(''); }}
                    >
                      Sign Up
                    </button>
                  </div>

                  {authMode === 'login' ? (
                    /* Login Form */
                    <div className="auth-form">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          className="form-input" 
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                          type="password" 
                          name="password"
                          className="form-input" 
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formError && <div className="form-error">{formError}</div>}
                      <button className="auth-btn" onClick={handleLogin}>Log In</button>
                    </div>
                  ) : (
                    /* Sign Up Form */
                    <div className="auth-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input 
                            type="text" 
                            name="firstName"
                            className="form-input" 
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input 
                            type="text" 
                            name="lastName"
                            className="form-input" 
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input 
                          type="email" 
                          name="email"
                          className="form-input" 
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input 
                          type="password" 
                          name="password"
                          className="form-input" 
                          placeholder="Create a password (min 6 characters)"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password *</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          className="form-input" 
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Age</label>
                          <input 
                            type="number" 
                            name="age"
                            className="form-input" 
                            placeholder="Age"
                            value={formData.age}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Weight (kg)</label>
                          <input 
                            type="number" 
                            name="weight"
                            className="form-input" 
                            placeholder="Weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Activity Level</label>
                        <select 
                          name="activityLevel"
                          className="form-select"
                          value={formData.activityLevel}
                          onChange={handleInputChange}
                        >
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Lightly Active</option>
                          <option value="moderate">Moderately Active</option>
                          <option value="active">Very Active</option>
                          <option value="athlete">Athlete</option>
                        </select>
                      </div>
                      {formError && <div className="form-error">{formError}</div>}
                      <button className="auth-btn" onClick={handleSignUp}>Create Account</button>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged In Profile View */
                <>
                  <div className="profile-header">
                    <div className="profile-avatar">👤</div>
                    <div className="profile-info">
                      <p className="profile-welcome">Welcome back,</p>
                      <h2>{userData?.firstName} {userData?.lastName}</h2>
                      <p>{userData?.email}</p>
                    </div>
                  </div>

                  <div className="profile-stats">
                    <div className="stat-box">
                      <div className="stat-box-value">{userData?.age || '--'}</div>
                      <div className="stat-box-label">Age</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box-value">{userData?.weight || '--'}kg</div>
                      <div className="stat-box-label">Weight</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box-value">{userData?.activityLevel === 'athlete' ? 'Athlete' : userData?.activityLevel?.charAt(0).toUpperCase() + userData?.activityLevel?.slice(1) || '--'}</div>
                      <div className="stat-box-label">Activity</div>
                    </div>
                  </div>

                  <div className="summary-card">
                    <h3 className="card-title">Weekly Statistics</h3>
                    <div className="summary-grid">
                      <div>
                        <p className="summary-item-value">89%</p>
                        <p className="summary-item-label">Avg Hydration</p>
                      </div>
                      <div>
                        <p className="summary-item-value">7000ml</p>
                        <p className="summary-item-label">Weekly Total</p>
                      </div>
                      <div>
                        <p className="summary-item-value">1</p>
                        <p className="summary-item-label">Days Streak</p>
                      </div>
                    </div>
                  </div>

                  <div className="summary-card">
                    <h3 className="card-title">Goals & Preferences</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <div style={{padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
                        <p style={{fontWeight: 600, marginBottom: '4px', color: 'var(--foreground)'}}>Daily Goal</p>
                        <p style={{color: 'var(--muted-foreground)', fontSize: '14px'}}>{dailyGoal}ml per day</p>
                      </div>
                      <div style={{padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
                        <p style={{fontWeight: 600, marginBottom: '4px', color: 'var(--foreground)'}}>Activity Level</p>
                        <p style={{color: 'var(--muted-foreground)', fontSize: '14px'}}>{userData?.activityLevel === 'athlete' ? 'Athlete' : userData?.activityLevel?.charAt(0).toUpperCase() + userData?.activityLevel?.slice(1)}</p>
                      </div>
                      <div style={{padding: '12px 0'}}>
                        <p style={{fontWeight: 600, marginBottom: '4px', color: 'var(--foreground)'}}>Account Email</p>
                        <p style={{color: 'var(--muted-foreground)', fontSize: '14px'}}>{userData?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{textAlign: 'center'}}>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
