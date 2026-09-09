# SanchayKranti

SanchayKranti is a digital circular-economy platform designed to connect waste generators, collection partners, material aggregators, recovery facilities, buyers, and administrators in one traceable material flow system.

The platform helps track waste from generation and collection to recovery, resale, and reuse while maintaining transparency through digital material passports.

---

## Problem Statement

Waste management systems often lack:

- Traceability of material movement
- Coordination between waste generators and collectors
- Structured aggregation of recyclable material
- Verification of recovered material
- Transparent marketplace access for buyers
- Digital records showing where material originated and how it was processed

SanchayKranti addresses these challenges through a unified web platform.

---

## Solution

SanchayKranti creates a connected circular-economy ecosystem where different stakeholders interact through dedicated dashboards.

### Material Flow

```text
Waste Generator
      |
      v
Collection Partner -----------+
                              |
                              v
                     Recovery Facility
                              |
                              v
                    Buyer / Manufacturer

Material Aggregator ----------+
The Administrator monitors users and system activity across the platform.

User Roles
1. Waste Generator

Waste generators can:

Register on the platform
Create pickup requests
Select waste material type
Enter material quantity
Add pickup address
Share current location
Track request status
View assigned collection partner
View actual collected quantity
2. Collection Partner

Collection partners can:

View available pickup requests
Accept collection jobs
Navigate to pickup location
Contact waste generators
Mark arrival
Enter actual collected weight
Complete pickup jobs
Monitor collection activity
3. Material Aggregator

Material aggregators can:

Record purchased scrap material
Enter seller information
Record quantity and purchase price
Maintain material inventory
Select recovery facilities
Dispatch material for processing
Track dispatched stock
4. Material Recovery Facility

Recovery facilities can:

Receive material from collection partners
Receive material from aggregators
Verify material weight
Assign material quality grade
Set recovery price
Process recovered material
Prepare material for buyer marketplace
Generate digital material passports
5. Buyer / Manufacturer

Buyers can:

Browse recovered material
Check available quantity
View material grade
View recovery price
Place purchase orders
Create material demand requests
Track previous orders
View live marketplace stock

Stock quantity is automatically reduced using Firestore transactions when an order is placed.

6. Administrator

Administrators can:

View all registered users
Verify users
Reject users
Activate or deactivate accounts
Monitor pickup requests
Monitor aggregator inventory
View buyer orders
View material passports
Monitor overall platform activity
Digital Material Passport

SanchayKranti generates a digital Material Passport for processed recyclable material.

Each passport contains information such as:

Passport ID
Material type
Material grade
Original quantity
Processed quantity
Source channel
Source information
Recovery facility
Recovery price
Material status
Material journey

A QR code is generated for each passport.

The QR code can be scanned to open a public traceability page without requiring login.

Technology Stack
Frontend
React
Vite
JavaScript
CSS
Lucide React
Backend / Cloud
Firebase Authentication
Cloud Firestore
Firebase Security Rules
Additional Libraries
react-qr-code
Deployment
Vercel
Version Control
Git
GitHub
Firebase Collections

The application currently uses collections including:

users
materialRequests
collectionJobs
collectorProfiles
collectorRatings
aggregatorInventory
recoveryBatches
buyerDemands
orders
materialPassports
statusHistory
notifications
impactFactors
Key Features
Multi-role authentication
Role-based dashboards
Real-time Firestore updates
Waste pickup workflow
Collector job management
Aggregator inventory
Recovery and verification workflow
Material processing
Recovered material marketplace
Buyer demand management
Transaction-safe stock deduction
Digital material passports
QR-based public traceability
Administrative verification
Geolocation support
Google Maps navigation
Multilingual collector interface
Application Workflow
Waste Generator
      |
      | Creates Pickup Request
      v
Collection Partner
      |
      | Collects Material
      v
Recovery Facility
      |
      | Verify + Grade + Process
      v
Recovered Material Marketplace
      |
      v
Buyer / Manufacturer
      |
      v
Material Reuse

Alternative supply route:

Local Seller / Scrap Supplier
      |
      v
Material Aggregator
      |
      | Aggregates Material
      v
Recovery Facility
      |
      v
Buyer / Manufacturer
Real-Time Traceability

The platform uses Cloud Firestore listeners to provide real-time updates.

For example:

Generator creates request
        ↓
Collector instantly receives request
        ↓
Collector accepts request
        ↓
Generator sees updated status
        ↓
Collector completes collection
        ↓
Recovery facility receives material
        ↓
Material is verified and processed
        ↓
Buyer purchases processed material
Marketplace Stock Management

Buyer orders use Firestore transactions.

This helps prevent incorrect stock updates when multiple users attempt to purchase material.

Example:

Available Material: 72 kg

Buyer Order: 10 kg

Remaining Material: 62 kg

The updated quantity is reflected in the marketplace in real time.

Material Traceability Model

Each processed material lot can be linked to a digital passport.

Example journey:

Material Source
      ↓
Collection Partner / Aggregator
      ↓
Recovery Facility
      ↓
Verification
      ↓
Processing
      ↓
Material Passport
      ↓
Buyer Marketplace
      ↓
Reuse
Project Structure
SanchayKranti/
│
├── src/
│   ├── components/
│   │   ├── AuthGate.jsx
│   │   ├── AuthPage.jsx
│   │   ├── WasteGeneratorDashboard.jsx
│   │   ├── CollectionPartnerDashboard.jsx
│   │   ├── MaterialAggregatorDashboard.jsx
│   │   ├── RecoveryFacilityDashboard.jsx
│   │   ├── BuyerDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── PublicPassportPage.jsx
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── wasteGeneratorService.js
│   │   ├── collectionService.js
│   │   ├── aggregatorService.js
│   │   ├── recoveryService.js
│   │   ├── buyerService.js
│   │   ├── passportService.js
│   │   └── adminService.js
│   │
│   ├── firebase.js
│   └── main.jsx
│
├── .env
├── .gitignore
├── package.json
└── README.md
