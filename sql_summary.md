# SQL CODE SUMMARY FOR DELIVERY HUB PROJECT

## Project Overview
This is a delivery hub application built with:
- PostgreSQL database using Drizzle ORM
- Express.js backend
- TypeScript
- Drizzle Kit for database migrations

## Database Schema

### Tables
1. **users** - Stores user information (customers, drivers, admins)
   - Fields: id, email, password, phone, fullName, role, isActive, metadata, createdAt
   - Role enum: customer, driver, admin, subadmin

2. **vehicles** - Stores vehicle information for drivers
   - Fields: id, name, capacity, baseFare, pricePerKm, images, createdAt

3. **drivers** - Links users to their vehicles and tracks driver status
   - Fields: id, userId, vehicleId, status, walletBalance, special, profile, createdAt
   - Status enum: pending, approved, offline, online

4. **zones** - Defines delivery zones with pricing information
   - Fields: id, name, address, coords, avgPrice, fixedPrice, createdAt

5. **service_categories** - Groups services by category
   - Fields: id, name, description, active, createdAt

6. **services** - Defines specific delivery services
   - Fields: id, categoryId, name, deliveryType, createdAt

7. **pricing** - Sets pricing rules for services in zones
   - Fields: id, serviceId, zoneId, priceType, fixedPrice, averagePrice, commissionType, commissionValue, createdAt

8. **orders** - Tracks delivery orders
   - Fields: id, requestNumber, customerId, driverId, serviceId, subService, status, paymentMethod, totalAmount, driverShare, location, notes, scheduledFor, createdAt
   - Status enum: new, pending, in_progress, picked_up, delivered, cancelled

9. **order_offers** - Manages driver bids on orders
   - Fields: id, orderId, driverId, price, accepted, createdAt

10. **transactions** - Tracks financial transactions
    - Fields: id, userId, type, amount, status, metadata, createdAt
    - Type enum: deposit, withdrawal, adjustment, commission

11. **notifications** - Manages user notifications
    - Fields: id, userId, title, message, type, read, createdAt

12. **messages** - Handles order-related messaging
    - Fields: id, orderId, fromUser, toUser, body, createdAt

13. **ratings** - Stores order ratings and feedback
    - Fields: id, orderId, raterId, ratedId, rating, feedback, createdAt

14. **admin_settings** - Stores application settings
    - Fields: id, key, value, updatedAt

## Key Features of the Schema
- UUID primary keys for all tables except admin_settings (serial)
- JSONB fields for multilingual content and flexible data storage
- Foreign key relationships between related entities
- Default values and constraints for data integrity
- Timestamps for audit trails

## SQL Operations Found in Code

### Common Queries
- SELECT operations with joins between related tables
- WHERE clauses with equality and filter conditions
- ORDER BY for sorting results (especially by createdAt)
- LIMIT and OFFSET for pagination (implied)

### Data Manipulation
- INSERT operations with RETURNING clause
- UPDATE operations with WHERE conditions
- Conditional updates based on ID

### Authentication & Authorization
- User lookup by email
- Role-based access control
- Session management

### Business Logic Queries
- Order creation with auto-generated request numbers
- Driver assignment to orders
- Status updates for orders and drivers
- Zone-based pricing calculations

## Drizzle ORM Usage
The project uses Drizzle ORM which generates the following SQL patterns:
- `db.select().from(table).where(condition)` → SELECT queries
- `db.insert(table).values(data).returning()` → INSERT queries
- `db.update(table).set(data).where(condition).returning()` → UPDATE queries
- `db.delete(table).where(condition)` → DELETE queries (not seen in current code)

## Relations
- Users have one driver profile
- Drivers belong to users and vehicles
- Orders connect customers, drivers, and services
- Pricing connects services and zones
- Messages connect to orders and users
- Ratings connect to orders and users

## Indexes (Implied)
- Email uniqueness on users table
- Foreign key indexes for performance
- Status-based indexes for filtering

## Additional Features
- Request number auto-generation for orders
- Driver status management
- Multilingual support through JSONB fields
- Flexible location data with JSONB
- Transaction tracking for financial operations
- Notification system
- Rating and feedback system