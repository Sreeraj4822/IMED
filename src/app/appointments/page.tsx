"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed';
}

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [newAppt, setNewAppt] = useState({ doctor: '', specialty: '', date: '', time: '' });

  const addAppointment = () => {
    if (!newAppt.doctor || !newAppt.date) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please provide the doctor's name and the date.",
      });
      return;
    }
    
    const appt: Appointment = {
      ...newAppt,
      id: Math.random().toString(36).substr(2, 9),
      status: 'upcoming'
    };
    setAppointments([appt, ...appointments]);
    
    toast({
      title: "Appointment Set",
      description: `Your visit with ${appt.doctor} has been scheduled.`,
    });

    setNewAppt({ doctor: '', specialty: '', date: '', time: '' });
    setIsAdding(false);
  };

  const deleteAppointment = (id: string) => {
    const removedAppt = appointments.find(a => a.id === id);
    setAppointments(appointments.filter(a => a.id !== id));
    
    if (removedAppt) {
      toast({
        variant: "destructive",
        title: "Appointment Deleted",
        description: `The visit with ${removedAppt.doctor} has been removed from your schedule.`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <CalendarIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">Appointments</h1>
            <p className="text-muted-foreground">Manage and track your doctor visits.</p>
          </div>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 rounded-full shadow-lg">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
              <DialogDescription>
                Schedule your next medical consultation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor" className="text-right">Doctor</Label>
                <Input id="doctor" value={newAppt.doctor} onChange={e => setNewAppt({...newAppt, doctor: e.target.value})} className="col-span-3" placeholder="Dr. Smith" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialty" className="text-right">Specialty</Label>
                <Input id="specialty" value={newAppt.specialty} onChange={e => setNewAppt({...newAppt, specialty: e.target.value})} className="col-span-3" placeholder="Cardiology" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <Input id="time" type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addAppointment} className="w-full">Save Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Upcoming Schedules
        </h2>
        <div className="grid gap-4">
          {appointments.filter(a => a.status === 'upcoming').length > 0 ? (
            appointments.filter(a => a.status === 'upcoming').map(appt => (
              <AppointmentCard key={appt.id} appt={appt} onDelete={deleteAppointment} />
            ))
          ) : (
            <p className="text-muted-foreground italic bg-muted/20 p-8 rounded-xl text-center border-2 border-dashed">No upcoming appointments scheduled.</p>
          )}
        </div>

        {appointments.filter(a => a.status === 'completed').length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-12 mb-4 text-muted-foreground">Past Appointments</h2>
            <div className="grid gap-4 opacity-70">
              {appointments.filter(a => a.status === 'completed').map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onDelete={deleteAppointment} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onDelete }: { appt: Appointment, onDelete: (id: string) => void }) {
  return (
    <Card className={cn(
      "relative transition-all border-l-4 group shadow-sm hover:shadow-md",
      appt.status === 'upcoming' ? "border-l-primary" : "border-l-muted bg-muted/30"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary">{appt.doctor}</h3>
              <p className="text-sm text-muted-foreground">{appt.specialty}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 pr-10">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarIcon className="h-4 w-4 text-primary/60" />
              <span>{appt.date}</span>
            </div>
            {appt.time && (
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary/60" />
                <span>{appt.time}</span>
              </div>
            )}
            <Badge variant={appt.status === 'upcoming' ? 'default' : 'secondary'} className="rounded-md">
              {appt.status === 'upcoming' ? (
                <span className="flex items-center gap-1"><Bell className="h-3 w-3" /> Scheduled</span>
              ) : (
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>
              )}
            </Badge>

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(appt.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete appointment</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
