# Requirements Document

## Introduction

AI Mandi is a multilingual smart market assistant that enables local vendors and buyers to communicate across different languages, discover fair prices using AI logic, and negotiate effectively in real time. This is a hackathon prototype focused on clean architecture, working features, simple implementation, easy setup, and minimal bugs.

## Glossary

- **AI_Mandi_System**: The complete web application including frontend and backend components
- **Language_Selector**: Component that allows users to choose their preferred language
- **Product_Form**: Form interface for entering product details
- **Price_Discovery_Engine**: AI component that suggests fair prices for products
- **Chat_System**: Real-time messaging system between buyers and vendors
- **Translation_Service**: Service that translates messages between different languages
- **Negotiation_Assistant**: AI component that provides negotiation suggestions
- **Dashboard**: Main user interface containing all application components
- **Vendor**: User who sells products
- **Buyer**: User who purchases products

## Requirements

### Requirement 1: Language Selection and Localization

**User Story:** As a user, I want to select my preferred language from available options, so that I can use the application in a language I understand.

#### Acceptance Criteria

1. WHEN a user accesses the application, THE Language_Selector SHALL display a dropdown with English, Hindi, Malayalam, and Tamil options
2. WHEN a user selects a language, THE AI_Mandi_System SHALL store the selection in local storage
3. WHEN a language is selected, THE AI_Mandi_System SHALL update all UI labels to display in the selected language
4. WHEN a user returns to the application, THE AI_Mandi_System SHALL restore their previously selected language from local storage

### Requirement 2: Product Information Management

**User Story:** As a vendor, I want to enter product details through a form, so that I can list my products for sale and get price suggestions.

#### Acceptance Criteria

1. WHEN a vendor accesses the product form, THE Product_Form SHALL display fields for product name, quantity, and unit
2. WHEN a vendor submits product information, THE Product_Form SHALL validate that all required fields are filled
3. WHEN validation fails, THE Product_Form SHALL display appropriate error messages and prevent submission
4. WHEN validation succeeds, THE Product_Form SHALL submit the product data to the backend system
5. THE Product_Form SHALL support units including kg, pieces, liters, and other common market units

### Requirement 3: AI Price Discovery

**User Story:** As a vendor, I want to receive AI-generated price suggestions for my products, so that I can set competitive and fair prices.

#### Acceptance Criteria

1. WHEN a product is successfully submitted, THE Price_Discovery_Engine SHALL calculate a suggested fair price
2. WHEN a price is calculated, THE AI_Mandi_System SHALL display the result in a price suggestion card
3. THE Price_Discovery_Engine SHALL use rule-based logic or mock dataset for price calculations
4. WHEN displaying price suggestions, THE AI_Mandi_System SHALL format prices in Indian Rupees with appropriate units
5. THE Price_Discovery_Engine SHALL provide price suggestions within 2 seconds of product submission

### Requirement 4: Real-Time Communication System

**User Story:** As a buyer or vendor, I want to chat in real-time with other users, so that I can negotiate prices and discuss product details.

#### Acceptance Criteria

1. WHEN users access the chat system, THE Chat_System SHALL display a WhatsApp-like chat interface with message bubbles
2. WHEN a user sends a message, THE Chat_System SHALL transmit it instantly using Socket.io
3. WHEN a message is received, THE Chat_System SHALL display it immediately in the chat window
4. THE Chat_System SHALL distinguish between sent and received messages with different bubble styles
5. WHEN the chat system is active, THE AI_Mandi_System SHALL maintain real-time connection without manual refresh

### Requirement 5: Message Translation Service

**User Story:** As a user, I want my messages to be automatically translated to other users' preferred languages, so that I can communicate effectively across language barriers.

#### Acceptance Criteria

1. WHEN a message is sent, THE Translation_Service SHALL detect the sender's selected language
2. WHEN a message is received by a user with different language preference, THE Translation_Service SHALL translate the message
3. THE Translation_Service SHALL display both original and translated text when languages differ
4. WHEN translation is not available, THE Translation_Service SHALL display the original message with a translation unavailable indicator
5. THE Translation_Service SHALL use mock or simple translation functions for the prototype

### Requirement 6: Negotiation Assistance

**User Story:** As a buyer or vendor, I want to receive AI-powered negotiation suggestions, so that I can make informed counter-offers during price negotiations.

#### Acceptance Criteria

1. WHEN users are engaged in price negotiation, THE Negotiation_Assistant SHALL analyze the conversation context
2. WHEN a price is mentioned, THE Negotiation_Assistant SHALL provide counter-offer suggestions based on market data
3. THE Negotiation_Assistant SHALL display suggestions in a helpful format with reasoning
4. WHEN market data is available, THE Negotiation_Assistant SHALL reference average market prices in suggestions
5. THE Negotiation_Assistant SHALL use rule-based logic for generating suggestions

### Requirement 7: Dashboard User Interface

**User Story:** As a user, I want to access all application features through a clean, modern dashboard, so that I can efficiently manage my market activities.

#### Acceptance Criteria

1. WHEN a user accesses the application, THE Dashboard SHALL display three main sections: product form, price suggestion card, and chat window
2. THE Dashboard SHALL implement responsive design that works on both desktop and mobile devices
3. WHEN viewed on mobile devices, THE Dashboard SHALL maintain usability and readability
4. THE Dashboard SHALL use modern, clean styling with Tailwind CSS
5. WHEN sections are updated, THE Dashboard SHALL reflect changes without requiring page refresh

### Requirement 8: System Architecture and Performance

**User Story:** As a developer, I want the system to have clean architecture and reliable performance, so that it can be easily maintained and deployed.

#### Acceptance Criteria

1. THE AI_Mandi_System SHALL separate frontend (React with Vite) and backend (Node.js with Express) into distinct folders
2. THE AI_Mandi_System SHALL use JSON file or in-memory storage instead of heavy databases
3. WHEN the application starts, THE AI_Mandi_System SHALL be ready for use within 10 seconds
4. THE AI_Mandi_System SHALL handle errors gracefully and display appropriate user messages
5. WHEN deployed, THE AI_Mandi_System SHALL run successfully with "npm install && npm run dev" commands

### Requirement 9: Data Persistence and Configuration

**User Story:** As a user, I want my preferences and data to be saved appropriately, so that I have a consistent experience across sessions.

#### Acceptance Criteria

1. WHEN a user selects a language, THE AI_Mandi_System SHALL persist the choice in browser local storage
2. WHEN the application needs configuration, THE AI_Mandi_System SHALL use environment files for settings
3. THE AI_Mandi_System SHALL include sample mock data for price discovery and translation features
4. WHEN data is stored, THE AI_Mandi_System SHALL use lightweight storage mechanisms appropriate for a prototype
5. THE AI_Mandi_System SHALL maintain data consistency across browser sessions