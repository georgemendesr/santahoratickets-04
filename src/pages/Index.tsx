
import { EventCard } from "@/components/ui/event-card";
import { type Event } from "@/types";

// Temporary mock data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival",
    description: "A fantastic summer music festival featuring top artists",
    date: "2024-07-15",
    time: "18:00",
    location: "Central Park, São Paulo",
    price: 150.00,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2940&auto=format&fit=crop",
    availableTickets: 100,
  },
  {
    id: "2",
    title: "Tech Conference 2024",
    description: "The biggest tech conference in Latin America",
    date: "2024-08-20",
    time: "09:00",
    location: "Convention Center, Rio de Janeiro",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2812&auto=format&fit=crop",
    availableTickets: 50,
  },
  {
    id: "3",
    title: "Stand-up Comedy Night",
    description: "A night of laughter with the best comedians",
    date: "2024-06-30",
    time: "20:00",
    location: "Comedy Club, Curitiba",
    price: 80.00,
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2874&auto=format&fit=crop",
    availableTickets: 75,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Discover Amazing Events
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find and book tickets for the best events happening in your city. 
              From concerts to conferences, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

