# Implementation Plan: AI Mandi – Multilingual Smart Market Assistant

## Overview

This implementation plan breaks down the AI Mandi application into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring a working application at each checkpoint. The plan follows clean architecture principles with proper separation between frontend and backend components.

## Tasks

- [x] 1. Project Setup and Foundation
  - Create project structure with separate frontend and backend folders
  - Initialize React app with Vite and Tailwind CSS configuration
  - Initialize Node.js backend with Express and Socket.io
  - Set up package.json files with all required dependencies
  - Create basic folder structure following the design specification
  - _Requirements: 8.1, 8.2_

- [ ] 2. Backend Core Infrastructure
  - [x] 2.1 Create Express server with CORS middleware
    - Set up basic Express server with proper middleware configuration
    - Configure CORS for frontend-backend communication
    - Add JSON parsing and error handling middleware
    - _Requirements: 8.4_
  
  - [x] 2.2 Implement Socket.io server setup
    - Configure Socket.io server for real-time communication
    - Set up basic connection handling and room management
    - _Requirements: 4.2, 4.5_
  
  - [x] 2.3 Create JSON data storage system
    - Implement file-based storage for products, prices, and translations
    - Create utility functions for reading/writing JSON files
    - Set up mock data files with sample content
    - _Requirements: 8.2, 9.3_

- [ ] 3. Price Discovery Engine
  - [ ] 3.1 Implement rule-based price calculation service
    - Create PriceDiscoveryEngine class with mock pricing logic
    - Implement quantity-based pricing adjustments
    - Add seasonal and category-based price variations
    - _Requirements: 3.1, 3.3_
  
  - [ ]* 3.2 Write property test for price discovery
    - **Property 4: Price Discovery Response**
    - **Validates: Requirements 3.1, 3.2, 3.4**
  
  - [ ] 3.3 Create price discovery API endpoint
    - Implement POST /api/products/analyze endpoint
    - Add input validation and error handling
    - Return properly formatted price suggestions
    - _Requirements: 3.2, 3.4_

- [ ] 4. Translation Service Implementation
  - [ ] 4.1 Create mock translation service
    - Implement TranslationService class with predefined translations
    - Add support for English, Hindi, Malayalam, and Tamil
    - Create fallback handling for untranslatable content
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  
  - [ ]* 4.2 Write property tests for translation service
    - **Property 6: Translation Service Behavior**
    - **Property 7: Translation Fallback Handling**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ] 4.3 Create translation API endpoint
    - Implement POST /api/translate endpoint
    - Add language detection and validation
    - Return structured translation responses
    - _Requirements: 5.3_

- [ ] 5. Chat System Backend
  - [ ] 5.1 Implement Socket.io chat handlers
    - Create chat event handlers for join_room, send_message, typing
    - Implement message broadcasting and room management
    - Add user session management
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 5.2 Write property test for message transmission
    - **Property 5: Real-time Message Transmission**
    - **Validates: Requirements 4.2, 4.3**
  
  - [ ] 5.3 Integrate translation with chat system
    - Add automatic message translation for different language users
    - Store original and translated messages
    - Handle translation errors gracefully
    - _Requirements: 5.1, 5.2_

- [ ] 6. Negotiation Assistant Service
  - [ ] 6.1 Implement negotiation suggestion engine
    - Create NegotiationAssistant class with rule-based logic
    - Implement price analysis and counter-offer generation
    - Add market data integration for suggestions
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  
  - [ ]* 6.2 Write property tests for negotiation assistant
    - **Property 8: Negotiation Suggestions Generation**
    - **Property 9: Market Data Integration**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  
  - [ ] 6.3 Create negotiation API endpoint
    - Implement POST /api/negotiation/suggest endpoint
    - Add chat context analysis
    - Return formatted suggestions with reasoning
    - _Requirements: 6.3_

- [ ] 7. Checkpoint - Backend Services Complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [ ] 8. Frontend Core Components
  - [ ] 8.1 Create App component with global state management
    - Set up main App component with React hooks for state
    - Implement language context and user session management
    - Add basic routing and component coordination
    - _Requirements: 1.2, 1.4_
  
  - [ ] 8.2 Implement LanguageSelector component
    - Create dropdown component with four language options
    - Add local storage integration for language persistence
    - Implement language change event handling
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 8.3 Write property tests for language selection
    - **Property 1: Language Selection Persistence**
    - **Property 2: UI Language Consistency**
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 9. Product Form Implementation
  - [ ] 9.1 Create ProductForm component
    - Build form with product name, quantity, and unit fields
    - Add form validation and error message display
    - Implement submission handling with loading states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 9.2 Write property test for form validation
    - **Property 3: Form Validation Behavior**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  
  - [ ] 9.3 Create PriceCard component
    - Implement price display card with formatting
    - Add loading states and error handling
    - Display confidence scores and market averages
    - _Requirements: 3.2, 3.4_

- [ ] 10. Chat Interface Implementation
  - [ ] 10.1 Create ChatInterface component
    - Build WhatsApp-like chat UI with message bubbles
    - Implement message sending and receiving
    - Add typing indicators and user status
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 10.2 Implement Socket.io client integration
    - Create useSocket custom hook for connection management
    - Handle connection, disconnection, and reconnection
    - Implement message event handling
    - _Requirements: 4.2, 4.3, 4.5_
  
  - [ ]* 10.3 Write integration tests for chat system
    - Test message sending and receiving flows
    - Verify real-time updates and connection handling
    - _Requirements: 4.2, 4.3_

- [ ] 11. Translation Integration Frontend
  - [ ] 11.1 Add translation display to chat messages
    - Show both original and translated text when languages differ
    - Add translation unavailable indicators
    - Implement language detection display
    - _Requirements: 5.3, 5.4_
  
  - [ ] 11.2 Create translation service client
    - Implement API client for translation requests
    - Add caching for repeated translations
    - Handle translation errors gracefully
    - _Requirements: 5.1, 5.2_

- [ ] 12. Negotiation Panel Implementation
  - [ ] 12.1 Create NegotiationPanel component
    - Build suggestion display with formatting and reasoning
    - Add price comparison and market data display
    - Implement suggestion interaction handling
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 12.2 Write unit tests for negotiation panel
    - Test suggestion display and formatting
    - Verify market data integration
    - _Requirements: 6.3, 6.4_

- [ ] 13. Dashboard Layout and Integration
  - [ ] 13.1 Create responsive dashboard layout
    - Implement three-section layout: form, price card, chat
    - Add responsive design for mobile and desktop
    - Ensure proper component spacing and styling
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 13.2 Implement dashboard state management
    - Connect all components with shared state
    - Add real-time updates without page refresh
    - Handle component communication and data flow
    - _Requirements: 7.5_
  
  - [ ]* 13.3 Write property test for dashboard reactivity
    - **Property 10: Dashboard Reactivity**
    - **Validates: Requirements 7.5**

- [ ] 14. Error Handling and User Experience
  - [ ] 14.1 Implement comprehensive error handling
    - Add error boundaries for React components
    - Implement user-friendly error messages
    - Add loading states and feedback indicators
    - _Requirements: 8.4_
  
  - [ ]* 14.2 Write property test for error handling
    - **Property 11: Error Handling Consistency**
    - **Validates: Requirements 8.4**
  
  - [ ] 14.3 Add data persistence validation
    - Ensure local storage data consistency
    - Implement data recovery mechanisms
    - Add session management features
    - _Requirements: 9.1, 9.5_
  
  - [ ]* 14.4 Write property test for data persistence
    - **Property 12: Data Persistence Consistency**
    - **Validates: Requirements 9.5**

- [ ] 15. Final Integration and Polish
  - [ ] 15.1 Connect all frontend and backend components
    - Wire all API endpoints with frontend components
    - Ensure proper data flow between all services
    - Add final error handling and edge case management
    - _Requirements: All requirements integration_
  
  - [ ] 15.2 Add environment configuration
    - Create .env files for development and production
    - Configure API URLs and Socket.io endpoints
    - Add deployment-ready configuration
    - _Requirements: 9.2_
  
  - [ ] 15.3 Create setup documentation
    - Write comprehensive README with setup instructions
    - Add npm scripts for easy development workflow
    - Document API endpoints and component usage
    - _Requirements: 8.5_

- [ ] 16. Final Checkpoint - Complete Application
  - Ensure all tests pass, verify all features work end-to-end, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and working software
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- The implementation follows clean architecture with proper separation of concerns