"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Stethoscope, 
  Pill, 
  Calendar, 
  Hospital, 
  Menu,
  HeartPulse,
  ChevronRight,
  MessageCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { name: 'IMED Search', href: '/', icon: Search, description: 'AI Medical Query' },
  { name: 'Symptom Checker', href: '/symptoms', icon: Stethoscope, description: 'Analyze your health' },
  { name: 'Blood Analyzer', href: '/blood-report', icon: FileText, description: 'Interpret lab results' },
  { name: 'Medicines', href: '/medicines', icon: Pill, description: 'Drug database' },
  { name: 'Appointments', href: '/appointments', icon: Calendar, description: 'Manage visits' },
  { name: 'Hospitals', href: '/hospitals', icon: Hospital, description: 'Find nearby care' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center group transition-all duration-300">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <HeartPulse className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="ml-3 flex flex-col">
              <span className="text-xl font-black tracking-tight text-primary font-headline leading-none">IMED Search AI</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 hidden sm:inline-block">Intelligent Care</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 group",
                    isActive 
                      ? "text-primary bg-primary/5 shadow-sm" 
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* AI Assistant Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all duration-300 hover:scale-110"
            title="AI Assistant"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">AI Assistant</span>
          </Button>

          {/* Mobile Navigation Trigger */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent rounded-full text-primary">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b text-left bg-muted/20">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <HeartPulse className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-bold text-primary text-xl">IMED Menu</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="px-4 mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Navigation</p>
                  </div>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-6 py-4 transition-all group relative",
                            isActive ? "bg-primary/5 border-r-4 border-primary" : "hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2.5 rounded-xl transition-all duration-300",
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                            )}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className={cn(
                                "font-bold text-base transition-colors",
                                isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                              )}>{item.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-5 w-5 text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary",
                            isActive && "text-primary"
                          )} />
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <div className="p-6 bg-muted/20 border-t space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Medical Assistant v1.0</span>
                    <span className="flex items-center gap-1 text-secondary font-bold">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                      System Active
                    </span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}