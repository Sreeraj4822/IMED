
"use client";

import { useState } from 'react';
import { Pill, Search, Info, ExternalLink, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceInput } from '@/components/medical/VoiceInput';

const MEDICINES = [
  { 
    id: 1, 
    name: 'Paracetamol', 
    type: 'Analgesic & Antipyretic', 
    description: 'Widely used over-the-counter medication for relieving mild to moderate pain (headaches, muscle aches) and reducing fever.',
    sideEffects: ['Rare', 'Nausea', 'Allergic reaction'],
    dosage: '500mg to 1000mg every 4-6 hours as needed.'
  },
  { 
    id: 2, 
    name: 'Ibuprofen', 
    type: 'NSAID', 
    description: 'Nonsteroidal anti-inflammatory drug used for relieving pain from headaches, dental pain, menstrual cramps, and reducing fever or inflammation.',
    sideEffects: ['Stomach pain', 'Heartburn', 'Nausea'],
    dosage: '200mg to 400mg every 4-6 hours as needed.'
  },
  { 
    id: 3, 
    name: 'Cetirizine', 
    type: 'Antihistamine', 
    description: 'Commonly used to relieve symptoms of the common cold and allergies, such as sneezing, runny nose, and itchy eyes.',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Tiredness'],
    dosage: '5mg to 10mg once daily.'
  },
  { 
    id: 4, 
    name: 'Azithromycin', 
    type: 'Macrolide Antibiotic', 
    description: 'Used to treat various bacterial infections, including respiratory infections and is often prescribed for cases of Typhoid fever.',
    sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain'],
    dosage: 'Often 500mg once daily for 3-5 days.'
  },
  { 
    id: 5, 
    name: 'Amoxicillin', 
    type: 'Antibiotic', 
    description: 'A penicillin-type antibiotic used to treat a wide range of bacterial infections like tonsillitis, bronchitis, and pneumonia.',
    sideEffects: ['Diarrhea', 'Upset stomach', 'Vomiting'],
    dosage: 'Variable based on the type of infection.'
  },
  { 
    id: 6, 
    name: 'Ciprofloxacin', 
    type: 'Quinolone Antibiotic', 
    description: 'A potent antibiotic frequently used to treat serious bacterial infections, including those that cause Typhoid fever.',
    sideEffects: ['Nausea', 'Diarrhea', 'Dizziness'],
    dosage: '250mg to 750mg twice daily.'
  },
  { 
    id: 7, 
    name: 'Metformin', 
    type: 'Anti-diabetic', 
    description: 'Used to treat type 2 diabetes by helping to restore your body\'s proper response to the insulin you naturally produce.',
    sideEffects: ['Nausea', 'Upset stomach', 'Diarrhea'],
    dosage: 'Usually taken with meals.'
  },
  { 
    id: 8, 
    name: 'Lisinopril', 
    type: 'ACE Inhibitor', 
    description: 'Used to treat high blood pressure (hypertension). Lowering high blood pressure helps prevent strokes and heart attacks.',
    sideEffects: ['Dizziness', 'Lightheadedness', 'Dry cough'],
    dosage: '5mg to 40mg daily.'
  },
  { 
    id: 9, 
    name: 'Atorvastatin', 
    type: 'Statin', 
    description: 'Used along with a proper diet to help lower "bad" cholesterol and fats and raise "good" cholesterol in the blood.',
    sideEffects: ['Joint pain', 'Nasal congestion', 'Sore throat'],
    dosage: '10mg to 80mg once daily.'
  },
  { 
    id: 10, 
    name: 'Omeprazole', 
    type: 'Proton Pump Inhibitor', 
    description: 'Used to treat certain stomach and esophagus problems (such as acid reflux, ulcers). It decreases stomach acid production.',
    sideEffects: ['Headache', 'Abdominal pain', 'Nausea'],
    dosage: '20mg to 40mg daily before a meal.'
  },
  { 
    id: 11, 
    name: 'Amlodipine', 
    type: 'Calcium Channel Blockers', 
    description: 'Used with or without other medications to treat high blood pressure and chest pain (angina).',
    sideEffects: ['Swelling of hands/ankles', 'Dizziness', 'Flushing'],
    dosage: '2.5mg to 10mg once daily.'
  },
  { 
    id: 12, 
    name: 'Levothyroxine', 
    type: 'Thyroid Hormone', 
    description: 'Used to treat an underactive thyroid (hypothyroidism). It replaces or provides more thyroid hormone.',
    sideEffects: ['Increased sweating', 'Sensitivity to heat', 'Nervousness'],
    dosage: 'Dosage is highly individualized based on weight and lab results.'
  },
  { 
    id: 13, 
    name: 'Albuterol', 
    type: 'Bronchodilator', 
    description: 'Used to prevent and treat wheezing and shortness of breath caused by breathing problems such as asthma or COPD.',
    sideEffects: ['Nervousness', 'Shaking (tremor)', 'Headache'],
    dosage: 'Usually 2 puffs every 4 to 6 hours as needed.'
  },
  { 
    id: 14, 
    name: 'Sertraline', 
    type: 'SSRI', 
    description: 'Used to treat depression, panic attacks, obsessive compulsive disorder, and social anxiety disorder.',
    sideEffects: ['Nausea', 'Dizziness', 'Dry mouth', 'Loss of appetite'],
    dosage: '50mg to 200mg once daily.'
  },
  { 
    id: 15, 
    name: 'Gabapentin', 
    type: 'Anticonvulsant', 
    description: 'Used with other medications to help control certain types of seizures and to relieve nerve pain following shingles.',
    sideEffects: ['Dizziness', 'Drowsiness', 'Unsteadiness'],
    dosage: '300mg to 600mg three times daily.'
  },
  {
    id: 16,
    name: 'Losartan',
    type: 'Angiotensin II Receptor Blocker',
    description: 'Used to treat high blood pressure (hypertension) and to help protect the kidneys from damage due to diabetes.',
    sideEffects: ['Upper respiratory infection', 'Dizziness', 'Stuffy nose'],
    dosage: '25mg to 100mg once daily.'
  },
  {
    id: 17,
    name: 'Metoprolol',
    type: 'Beta Blocker',
    description: 'Used to treat high blood pressure, chest pain (angina), and heart failure.',
    sideEffects: ['Tiredness', 'Dizziness', 'Shortness of breath'],
    dosage: '25mg to 100mg daily or twice daily.'
  },
  {
    id: 18,
    name: 'Hydrochlorothiazide',
    type: 'Thiazide Diuretic',
    description: 'Used to treat high blood pressure and fluid retention (edema) caused by various conditions.',
    sideEffects: ['Dizziness', 'Headache', 'Frequent urination'],
    dosage: '12.5mg to 50mg once daily.'
  },
  {
    id: 19,
    name: 'Prednisone',
    type: 'Corticosteroid',
    description: 'Used to treat conditions such as arthritis, blood disorders, breathing problems, and severe allergies.',
    sideEffects: ['Insomnia', 'Increased appetite', 'Mood changes'],
    dosage: 'Highly variable; depends on the condition being treated.'
  },
  {
    id: 20,
    name: 'Montelukast',
    type: 'Leukotriene Receptor Antagonist',
    description: 'Used to prevent wheezing, difficulty breathing, chest tightness, and coughing caused by asthma.',
    sideEffects: ['Headache', 'Stomach pain', 'Heartburn'],
    dosage: '10mg once daily in the evening.'
  },
  {
    id: 21,
    name: 'Rosuvastatin',
    type: 'HMG-CoA Reductase Inhibitor',
    description: 'Used along with a proper diet to help lower "bad" cholesterol and fats and raise "good" cholesterol in the blood.',
    sideEffects: ['Headache', 'Muscle aches', 'Abdominal pain'],
    dosage: '5mg to 40mg once daily.'
  },
  {
    id: 22,
    name: 'Escitalopram',
    type: 'SSRI',
    description: 'Used to treat depression and generalized anxiety disorder. It restores serotonin balance in the brain.',
    sideEffects: ['Nausea', 'Sleepiness', 'Increased sweating'],
    dosage: '10mg to 20mg once daily.'
  },
  {
    id: 23,
    name: 'Pantoprazole',
    type: 'Proton Pump Inhibitor',
    description: 'Used to treat certain stomach and esophagus problems such as acid reflux.',
    sideEffects: ['Headache', 'Diarrhea', 'Joint pain'],
    dosage: '40mg once daily before a meal.'
  },
  {
    id: 24,
    name: 'Fluoxetine',
    type: 'SSRI',
    description: 'Used to treat depression, panic attacks, obsessive-compulsive disorder, and certain eating disorders.',
    sideEffects: ['Sleep problems', 'Strange dreams', 'Tremor'],
    dosage: '20mg to 60mg once daily.'
  }
];

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredMeds = MEDICINES.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <Pill className="h-8 w-8 text-secondary" />
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">Medicine Database</h1>
            <p className="text-muted-foreground">Search for drug information, side effects, and dosages.</p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name, type or condition..." 
              className="pl-10 h-11 border-primary/20 focus:border-primary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <VoiceInput onTranscript={setSearchTerm} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeds.length > 0 ? (
          filteredMeds.map(med => (
            <Card key={med.id} className="overflow-hidden border-t-4 border-t-secondary hover:shadow-lg transition-all flex flex-col h-full group">
              <CardHeader className="bg-muted/30 group-hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl font-headline text-primary">{med.name}</CardTitle>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 whitespace-nowrap">
                    {med.type.split(' ').slice(-1)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-2 font-medium">{med.type}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">{med.description}</p>
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Common Side Effects</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {med.sideEffects.map((effect, i) => (
                      <span key={i} className="text-[11px] bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full font-medium">{effect}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Standard Dosage</h4>
                  <p className="text-sm text-foreground font-medium">{med.dosage}</p>
                </div>
              </CardContent>
              <div className="px-6 py-4 border-t bg-muted/5 flex justify-between items-center mt-auto">
                <Button variant="link" size="sm" className="p-0 h-auto flex items-center gap-1 text-primary font-bold">
                  View Full Details <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 p-0 hover:text-primary">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">External source</span>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-2xl font-bold text-primary">No results found</h3>
            <p className="text-muted-foreground mt-2">Try searching with a different medication name or medical condition.</p>
            <Button variant="outline" className="mt-8" onClick={() => setSearchTerm('')}>
              Clear Search Query
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
