import {
  AgentTypeEnum,
  LLMProviderEnum,
  AgentConfig,
} from '../core/domain/types/agent.types';

/**
 * Restaurant Customer Support Agent Example Configuration
 *
 * A specialized AI agent for restaurant customer support that handles:
 * - Reservation inquiries and bookings
 * - Menu recommendations
 * - Operating hours and location information
 * - Special dietary requirement handling
 * - Complaint resolution and refunds
 * - Table availability checks
 *
 * Real-world use case: Multi-location restaurant chain needing 24/7 customer support
 */
export const restaurantSupportAgentConfig: AgentConfig = {
  type: AgentTypeEnum.GENERAL,
  name: 'Restaurant Support Assistant',
  description:
    'AI-powered customer support agent for restaurant operations including reservations, menu inquiries, and complaint resolution',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
  },
  maxIterations: 15,
  timeoutMs: 45000,
  systemPrompt: `You are a professional restaurant customer support assistant. Your role is to:
1. Help customers make and manage reservations
2. Answer questions about menu items, prices, and ingredients
3. Provide restaurant information (hours, location, parking)
4. Handle dietary restrictions and allergies carefully
5. Address complaints professionally and offer solutions
6. Process refund requests or offer compensation
7. Recommend dishes based on customer preferences
8. Inform about special events and promotions

Always be polite, professional, and empathetic. If you don't have information, direct customers to speak with a manager.
Ask clarifying questions to understand customer needs better.
Never make promises outside your authority - always offer to escalate to management.`,
  enableMemory: true,
  enableStreaming: true,
  tools: [
    'check_reservation_availability',
    'create_reservation',
    'get_menu_items',
    'check_table_status',
    'get_restaurant_info',
    'handle_complaint',
    'process_refund',
    'get_special_offers',
  ],
  metadata: {
    category: 'restaurant_hospitality',
    targetAudience: 'restaurant_customers',
    responseStyle: 'professional_and_empathetic',
    industrySpecific: true,
  },
};

/**
 * Restaurant Support Agent Tools
 * These tools represent real operations a restaurant might perform
 */
export const restaurantSupportTools = [
  {
    id: 'check_reservation_availability',
    name: 'check_reservation_availability',
    description: 'Check available time slots for restaurant reservations',
    schema: {
      date: {
        type: 'string',
        description: 'Reservation date (YYYY-MM-DD format)',
      },
      time: {
        type: 'string',
        description: 'Preferred time (HH:MM format)',
      },
      party_size: {
        type: 'number',
        description: 'Number of people in the party',
      },
    },
    execute: (input: Record<string, unknown>) => {
      // Simulate reservation system check
      const requestedTime = new Date(
        `${input.date as string}T${input.time as string}`,
      );
      const isToday =
        new Date().toDateString() === requestedTime.toDateString();

      if (isToday) {
        return {
          success: false,
          message: 'Reservations must be made at least 2 hours in advance',
          availableAlternatives: ['19:00', '19:30', '20:00', '20:30'],
        };
      }

      // Mock available slots
      const availableSlots = [
        '18:00',
        '18:30',
        '19:00',
        '19:30',
        '20:00',
        '20:30',
        '21:00',
      ];
      const isAvailable = Math.random() > 0.2; // 80% availability

      if (isAvailable) {
        return {
          success: true,
          availableSlots,
          selectedTime: input.time,
          message: `Table for ${input.party_size as number} is available at ${input.time as string}`,
        };
      } else {
        // Suggest alternatives
        const alternatives = availableSlots.filter(
          (slot) => slot !== input.time,
        );
        return {
          success: false,
          message: `No table available at ${input.time as string}`,
          alternatives: alternatives.slice(0, 3),
        };
      }
    },
  },
  {
    id: 'create_reservation',
    name: 'create_reservation',
    description: 'Create a new restaurant reservation',
    schema: {
      date: { type: 'string', description: 'Reservation date (YYYY-MM-DD)' },
      time: { type: 'string', description: 'Reservation time (HH:MM)' },
      party_size: { type: 'number', description: 'Number of guests' },
      name: { type: 'string', description: 'Customer name' },
      phone: { type: 'string', description: 'Contact phone number' },
      special_requests: {
        type: 'string',
        description: 'Any special requests or dietary restrictions',
      },
    },
    execute: (input: Record<string, unknown>) => {
      const reservationId =
        'RES-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      return {
        success: true,
        reservationId,
        confirmationMessage: `Reservation confirmed for ${input.name as string} on ${input.date as string} at ${input.time as string} for ${input.party_size as number} guests`,
        bookingDetails: {
          id: reservationId,
          date: input.date,
          time: input.time,
          partySize: input.party_size,
          customerName: input.name,
          phone: input.phone,
          specialRequests: (input.special_requests as string) || 'None',
        },
        cancellationPolicy:
          'Free cancellation up to 24 hours before reservation',
      };
    },
  },
  {
    id: 'get_menu_items',
    name: 'get_menu_items',
    description: 'Get menu items and recommendations based on preferences',
    schema: {
      category: {
        type: 'string',
        description: 'Menu category (appetizers, mains, desserts, beverages)',
      },
      dietary_restriction: {
        type: 'string',
        description:
          'Dietary preference (vegetarian, vegan, gluten-free, keto)',
      },
      price_range: {
        type: 'string',
        description: 'Price preference (budget, moderate, premium)',
      },
    },
    execute: (input: Record<string, unknown>) => {
      const menuItems: Record<string, any[]> = {
        appetizers: [
          {
            name: 'Bruschetta',
            price: 12,
            description: 'Toasted bread with tomatoes and basil',
          },
          {
            name: 'Calamari',
            price: 14,
            description: 'Fried squid with lemon',
          },
          {
            name: 'Salad',
            price: 10,
            description: 'House salad with seasonal vegetables',
          },
        ],
        mains: [
          {
            name: 'Grilled Salmon',
            price: 28,
            description: 'Fresh salmon with lemon butter',
          },
          {
            name: 'Pasta Carbonara',
            price: 18,
            description: 'Classic Italian pasta',
          },
          { name: 'Ribeye Steak', price: 35, description: '12oz premium cut' },
        ],
        desserts: [
          {
            name: 'Tiramisu',
            price: 8,
            description: 'Classic Italian dessert',
          },
          {
            name: 'Chocolate Cake',
            price: 9,
            description: 'Rich chocolate cake',
          },
        ],
      };

      const category = ((input.category as string) || 'mains').toLowerCase();
      const items = menuItems[category] || [];

      return {
        success: true,
        category,
        items,
        recommendations: items.slice(0, 2),
        dietaryInfo: {
          vegetarian: 'Marked with (V)',
          vegan: 'Marked with (VG)',
          glutenFree: 'Ask server for options',
        },
      };
    },
  },
  {
    id: 'check_table_status',
    name: 'check_table_status',
    description: 'Check current table status and wait times',
    schema: {
      party_size: { type: 'number', description: 'Number of people' },
    },
    execute: () => {
      const currentWaitTime = Math.floor(Math.random() * 45) + 5; // 5-50 min
      const estimatedSeatingTime =
        Math.floor(Date.now() / 1000) + currentWaitTime * 60;

      return {
        success: true,
        currentWaitTime: `${currentWaitTime} minutes`,
        estimatedSeatingTime: new Date(
          estimatedSeatingTime * 1000,
        ).toLocaleTimeString(),
        availableTables: Math.floor(Math.random() * 3) + 1,
        message:
          currentWaitTime > 30
            ? 'High demand - consider visiting during off-peak hours'
            : 'Reasonable wait time',
      };
    },
  },
  {
    id: 'get_restaurant_info',
    name: 'get_restaurant_info',
    description: 'Get restaurant information like hours, location, parking',
    schema: {
      info_type: {
        type: 'string',
        description: 'Type of info (hours, location, parking, phone, delivery)',
      },
    },
    execute: (input: Record<string, unknown>) => {
      const restaurantInfo = {
        hours: {
          monday_friday: '11:00 AM - 10:00 PM',
          saturday: '10:00 AM - 11:00 PM',
          sunday: '10:00 AM - 9:00 PM',
          closed: 'Never',
        },
        location: {
          address: '123 Main Street, Downtown',
          phone: '(555) 123-4567',
          email: 'info@restaurant.com',
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
        parking: {
          street: 'Available on surrounding streets',
          valet: 'Available Thursday-Saturday 6PM-10PM',
          disabled: 'ADA compliant parking available',
        },
        delivery: {
          platforms: ['DoorDash', 'Uber Eats', 'Grubhub', 'Direct'],
          minOrder: '$15',
          deliveryTime: '30-45 minutes',
        },
      };

      const infoType = ((input.info_type as string) || 'all').toLowerCase();
      return {
        success: true,
        infoType,
        ...restaurantInfo,
      };
    },
  },
  {
    id: 'handle_complaint',
    name: 'handle_complaint',
    description: 'Handle customer complaints and log issues for management',
    schema: {
      complaint_type: {
        type: 'string',
        description:
          'Type of complaint (food_quality, service, cleanliness, wait_time)',
      },
      description: {
        type: 'string',
        description: 'Detailed complaint description',
      },
      reservation_id: {
        type: 'string',
        description: 'Related reservation ID if applicable',
      },
    },
    execute: () => {
      const complaintId =
        'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      return {
        success: true,
        complaintId,
        message:
          'Your complaint has been logged and will be reviewed by management',
        nextSteps: [
          'Manager will contact you within 24 hours',
          'We appreciate your feedback to improve our service',
          'Possible compensation or resolution to be offered',
        ],
        managementWillContact: true,
        targetResponse: '24 hours',
      };
    },
  },
  {
    id: 'process_refund',
    name: 'process_refund',
    description: 'Process refunds or offer compensation for issues',
    schema: {
      reason: { type: 'string', description: 'Reason for refund' },
      amount: { type: 'number', description: 'Refund amount in dollars' },
      reservation_id: {
        type: 'string',
        description: 'Related reservation ID',
      },
    },
    execute: (input: Record<string, unknown>) => {
      const refundId =
        'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      return {
        success: true,
        refundId,
        amount: input.amount,
        reason: input.reason,
        status: 'Approved',
        processingTime: '3-5 business days',
        message: `Refund of $${input.amount as number} has been approved and will be processed to your original payment method`,
        compensationOffer: [
          '10% discount on next visit',
          'Free appetizer on next visit',
          'Credit for delivery fee',
        ],
      };
    },
  },
  {
    id: 'get_special_offers',
    name: 'get_special_offers',
    description: 'Get current special offers and promotions',
    schema: {
      type: {
        type: 'string',
        description: 'Offer type (happy_hour, early_bird, loyalty, events)',
      },
    },
    execute: (input: Record<string, unknown>) => {
      const offers: Record<string, Record<string, unknown>> = {
        happy_hour: {
          name: 'Happy Hour',
          time: '3:00 PM - 6:00 PM, Monday - Friday',
          discount: '25% off selected beverages',
          details: 'Appetizers at half price',
        },
        early_bird: {
          name: 'Early Bird Special',
          time: '11:00 AM - 5:00 PM daily',
          discount: '15% off full menu',
          details: 'Dine-in only',
        },
        loyalty: {
          name: 'Loyalty Program',
          description: 'Earn points on every visit',
          benefits: [
            '$1 per $10 spent',
            'Birthday bonus',
            'Member-only events',
          ],
        },
        events: {
          name: 'Upcoming Events',
          list: [
            'Wine Tasting Night - Friday 7PM',
            'Live Jazz - Saturday 8PM',
            'Sunday Brunch Special - 10AM-2PM',
          ],
        },
      };

      const offerType = ((input.type as string) || 'all').toLowerCase();
      return {
        success: true,
        offers:
          offerType === 'all'
            ? offers
            : offers[offerType] || {
                message: 'No matching offers',
              },
      };
    },
  },
];

/**
 * Example Usage and Integration
 *
 * This agent can be integrated into:
 * 1. Website chat widget
 * 2. WhatsApp Business API
 * 3. Facebook Messenger
 * 4. Phone IVR system
 * 5. Mobile app
 *
 * Example flow:
 * Customer: "I'd like to make a reservation for 4 people tomorrow at 7 PM"
 * Agent: [checks availability] "Great! I have a table available at 7 PM for 4 people tomorrow.
 *         To complete your reservation, I'll need your name and phone number."
 * Customer: "John Smith, 555-9876"
 * Agent: [creates reservation] "Perfect! Your reservation is confirmed. Details:
 *         Reservation ID: RES-ABC123, Date: Tomorrow at 7 PM, Party size: 4
 *         Please arrive 10 minutes early. Do you have any dietary restrictions I should note?"
 * Customer: "Yes, one person is vegetarian"
 * Agent: [saves info] "Noted! I've added that to your reservation. We'll have special options
 *         ready. You can reach us at (555) 123-4567. See you tomorrow!"
 */

export const restaurantSupportUsageExample = {
  scenario: 'Customer making a reservation with special requests',
  userMessages: [
    'Hi, I want to book a table for 4 people',
    'Tomorrow at 7 PM please',
    'My name is Sarah Johnson',
    'Phone is 555-5555',
    'One person in our group is vegetarian',
    'Can you recommend something for them?',
  ],
  expectedAgentActions: [
    'check_reservation_availability',
    'create_reservation',
    'get_menu_items (with vegetarian filter)',
  ],
};
