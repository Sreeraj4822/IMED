"use client";

import { Hospital, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HospitalsPage() {
  // Default search for hospitals near the user
  const embedUrl = `https://maps.google.com/maps?q=hospitals+near+me&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-secondary/10 p-3 rounded-2xl">
            <Hospital className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-primary font-headline tracking-tight">Medical Facilities</h1>
            <p className="text-muted-foreground font-medium">Live interactive map of hospitals and clinics worldwide.</p>
          </div>
        </div>
      </div>

      <Card className="h-[700px] border-none shadow-2xl rounded-3xl overflow-hidden relative group bg-card/50 backdrop-blur-sm">
        <iframe
          title="Google Maps"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedUrl}
          className="filter contrast-110 saturate-75"
        />
        
        {/* Map Information Overlay */}
        <div className="absolute top-6 left-6 pointer-events-none">
          <div className="flex flex-col gap-2">
            <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg border-none px-4 py-2 text-sm w-fit">
              <MapPin className="h-4 w-4 mr-2 text-secondary" />
              Showing Hospitals Near You
            </Badge>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest px-1">
              Live Data Sync Active
            </p>
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <Button 
            className="rounded-full shadow-2xl gap-2 bg-primary px-8 h-12 hover:scale-105 transition-transform font-bold" 
            asChild
          >
            <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noopener noreferrer">
              <Navigation className="h-5 w-5" />
              Get Precise Directions
            </a>
          </Button>
          <Button 
            variant="secondary"
            className="rounded-full shadow-2xl gap-2 px-8 h-12 hover:scale-105 transition-transform font-bold" 
            asChild
          >
            <a href="https://www.google.com/maps/search/hospitals" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5" />
              Open Full Map
            </a>
          </Button>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          The map automatically populates with the most up-to-date hospital records from Google.
        </p>
      </div>
    </div>
  );
}
