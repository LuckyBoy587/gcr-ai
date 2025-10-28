/**
 * Example usage of the Google Classroom API Client
 * 
 * This file demonstrates various ways to use the API client
 * for making authenticated requests to Google Classroom API.
 * 
 * Note: This file is located in the project root for reference.
 * If you copy these examples to other files, adjust the import paths accordingly.
 */

import { GoogleClassroomClient, makeAuthenticatedRequest } from './src/api/gcr.js';

// Replace these with your actual credentials
const CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
const CLIENT_SECRET = 'your-client-secret';

/**
 * Example 1: Simple one-time request using the simplified API
 */
async function example1_SimpleRequest() {
  try {
    const response = await makeAuthenticatedRequest({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      scopes: 'https://www.googleapis.com/auth/classroom.courses.readonly',
      endpoint: 'https://classroom.googleapis.com/v1/courses',
      method: 'GET'
    });
    
    console.log('Courses:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 2: Using the client class for multiple requests
 */
async function example2_MultipleRequests() {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  try {
    // Check if already authenticated
    if (!client.isAuthenticated()) {
      // This will redirect to Google's OAuth page
      await client.authorize([
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.rosters.readonly'
      ]);
      return; // Won't reach here due to redirect
    }
    
    // Fetch all courses
    const courses = await client.makeRequest({
      endpoint: 'https://classroom.googleapis.com/v1/courses',
      method: 'GET'
    });
    
    console.log('All courses:', courses);
    
    // Fetch students for the first course
    if (courses.courses && courses.courses.length > 0) {
      const courseId = courses.courses[0].id;
      const students = await client.makeRequest({
        endpoint: `https://classroom.googleapis.com/v1/courses/${courseId}/students`,
        method: 'GET'
      });
      
      console.log('Students:', students);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Creating a new course (requires write permissions)
 */
async function example3_CreateCourse() {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  try {
    // Check if already authenticated
    if (!client.isAuthenticated()) {
      await client.authorize('https://www.googleapis.com/auth/classroom.courses');
      return;
    }
    
    // Create a new course
    const newCourse = await client.makeRequest({
      endpoint: 'https://classroom.googleapis.com/v1/courses',
      method: 'POST',
      body: {
        name: 'Introduction to Computer Science',
        section: 'Period 3',
        descriptionHeading: 'Welcome to CS101',
        description: 'An introductory course to computer science fundamentals',
        room: 'Room 301',
        ownerId: 'me', // 'me' refers to the authenticated user
        courseState: 'PROVISIONED'
      }
    });
    
    console.log('Created course:', newCourse);
  } catch (error) {
    console.error('Error creating course:', error.message);
  }
}

/**
 * Example 4: Getting a specific course by ID
 */
async function example4_GetCourse(courseId) {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  try {
    if (!client.isAuthenticated()) {
      await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');
      return;
    }
    
    const course = await client.makeRequest({
      endpoint: `https://classroom.googleapis.com/v1/courses/${courseId}`,
      method: 'GET'
    });
    
    console.log('Course details:', course);
  } catch (error) {
    console.error('Error fetching course:', error.message);
  }
}

/**
 * Example 5: Handling OAuth callback
 * This would typically be in your main app component
 */
function example5_HandleOAuthCallback() {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  // Check if we're on the callback URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (code && state) {
    client.handleCallback(code, state)
      .then(() => {
        console.log('Successfully authenticated!');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Now you can make API requests
      })
      .catch(error => {
        console.error('Authentication failed:', error.message);
      });
  }
}

/**
 * Example 6: Manually refreshing token
 */
async function example6_RefreshToken() {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  try {
    // Check if token is expired
    if (client.isTokenExpired()) {
      console.log('Token expired, refreshing...');
      await client.refreshAccessToken();
      console.log('Token refreshed successfully');
    } else {
      console.log('Token is still valid');
    }
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    // If refresh fails, need to re-authorize
    await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');
  }
}

/**
 * Example 7: Logout (clear tokens)
 */
function example7_Logout() {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  client.clearTokens();
  console.log('Logged out successfully');
}

/**
 * Example 8: Listing coursework for a course
 */
async function example8_GetCoursework(courseId) {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  try {
    if (!client.isAuthenticated()) {
      await client.authorize('https://www.googleapis.com/auth/classroom.coursework.students');
      return;
    }
    
    const coursework = await client.makeRequest({
      endpoint: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      method: 'GET'
    });
    
    console.log('Coursework:', coursework);
  } catch (error) {
    console.error('Error fetching coursework:', error.message);
  }
}

/**
 * Example 9: Error handling
 */
async function example9_ErrorHandling() {
  const client = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
  
  try {
    // Attempt to fetch courses
    const courses = await client.makeRequest({
      endpoint: 'https://classroom.googleapis.com/v1/courses',
      method: 'GET'
    });
    
    console.log('Success:', courses);
  } catch (error) {
    // Handle different error types
    if (error.message.includes('401')) {
      console.error('Authentication error - need to re-authorize');
      await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');
    } else if (error.message.includes('403')) {
      console.error('Permission denied - check your scopes');
    } else if (error.message.includes('404')) {
      console.error('Resource not found');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}

/**
 * Example 10: Using with React component
 * Note: This is pseudocode for demonstration purposes.
 * In actual implementation, import React and hooks properly.
 */
function Example10_ReactIntegration() {
  // This is pseudocode showing how to integrate with React
  // Uncomment and add proper imports when using this example:
  // import React, { useState, useEffect } from 'react';
  
  /* Example React component (commented to avoid linting errors):
  const MyComponent = () => {
    const [client, setClient] = useState(null);
    const [courses, setCourses] = useState(null);
    
    useEffect(() => {
      // Initialize client
      const newClient = new GoogleClassroomClient(CLIENT_ID, CLIENT_SECRET);
      setClient(newClient);
      
      // Handle OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        newClient.handleCallback(code, state)
          .then(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      }
    }, []);
    
    const fetchCourses = async () => {
      if (!client.isAuthenticated()) {
        await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');
        return;
      }
      
      const result = await client.makeRequest({
        endpoint: 'https://classroom.googleapis.com/v1/courses',
        method: 'GET'
      });
      
      setCourses(result);
    };
    
    return (
      <div>
        <button onClick={fetchCourses}>Fetch Courses</button>
        {courses && <pre>{JSON.stringify(courses, null, 2)}</pre>}
      </div>
    );
  };
  */
  
  // See src/App.jsx for a working React implementation
  console.log('See src/App.jsx for a working React implementation');
}

// Export examples for use
export {
  example1_SimpleRequest,
  example2_MultipleRequests,
  example3_CreateCourse,
  example4_GetCourse,
  example5_HandleOAuthCallback,
  example6_RefreshToken,
  example7_Logout,
  example8_GetCoursework,
  example9_ErrorHandling,
  Example10_ReactIntegration
};
