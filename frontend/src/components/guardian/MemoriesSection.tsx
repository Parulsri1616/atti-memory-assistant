import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  MapPin,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Heart,
  Phone,
  Mic,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  Search,
  Volume2
} from 'lucide-react';
import {
  Person,
  LifeEvent,
  FamiliarPlace,
  MemoryFact
} from '../../types';

interface MemoriesSectionProps {
  initialSubTab?: string;
  people: Person[];
  events: LifeEvent[];
  places: FamiliarPlace[];
  facts: MemoryFact[];
  onCreatePerson: (data: Partial<Person>) => Promise<void>;
  onUpdatePerson: (id: number, data: Partial<Person>) => Promise<void>;
  onDeletePerson: (id: number) => Promise<void>;
  onCreateEvent: (data: Partial<LifeEvent>) => Promise<void>;
  onUpdateEvent: (id: number, data: Partial<LifeEvent>) => Promise<void>;
  onDeleteEvent: (id: number) => Promise<void>;
  onCreatePlace: (data: Partial<FamiliarPlace>) => Promise<void>;
  onUpdatePlace: (id: number, data: Partial<FamiliarPlace>) => Promise<void>;
  onDeletePlace: (id: number) => Promise<void>;
  onCreateFact: (data: Partial<MemoryFact>) => Promise<void>;
  onUpdateFact: (id: number, data: Partial<MemoryFact>) => Promise<void>;
  onDeleteFact: (id: number) => Promise<void>;
  isDark?: boolean;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  initialSubTab = 'family',
  people,
  events,
  places,
  facts,
  onCreatePerson,
  onUpdatePerson,
  onDeletePerson,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCreatePlace,
  onUpdatePlace,
  onDeletePlace,
  onCreateFact,
  onUpdateFact,
  onDeleteFact,
  isDark = true
}) => {
  const [subTab, setSubTab] = useState<'family' | 'history' | 'places' | 'facts'>(
    (initialSubTab as any) || 'family'
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);
  const [personForm, setPersonForm] = useState<Partial<Person>>({
    name: '',
    relationship: '',
    phone: '',
    photo_url: '',
    description: '',
    notes: '',
    visit_schedule: '',
    voice_message_url: ''
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState<Partial<LifeEvent>>({
    title: '',
    date_or_period: '',
    category: 'memory',
    description: ''
  });

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);
  const [placeForm, setPlaceForm] = useState<Partial<FamiliarPlace>>({
    name: '',
    address_or_location: '',
    category: 'frequent',
    description: '',
    is_safe_zone: false
  });

  const [showFactModal, setShowFactModal] = useState(false);
  const [editingFactId, setEditingFactId] = useState<number | null>(null);
  const [factForm, setFactForm] = useState<Partial<MemoryFact>>({
    category: 'faq',
    question_or_topic: '',
    answer_or_detail: '',
    is_verified: true,
    notes: ''
  });

  // Handlers
  const handlePersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPersonId) {
      await onUpdatePerson(editingPersonId, personForm);
    } else {
      await onCreatePerson(personForm);
    }
    setShowPersonModal(false);
    setEditingPersonId(null);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      await onUpdateEvent(editingEventId, eventForm);
    } else {
      await onCreateEvent(eventForm);
    }
    setShowEventModal(false);
    setEditingEventId(null);
  };

  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlaceId) {
      await onUpdatePlace(editingPlaceId, placeForm);
    } else {
      await onCreatePlace(placeForm);
    }
    setShowPlaceModal(false);
    setEditingPlaceId(null);
  };

  const handleFactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFactId) {
      await onUpdateFact(editingFactId, factForm);
    } else {
      await onCreateFact(factForm);
    }
    setShowFactModal(false);
    setEditingFactId(null);
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-200/70 border-slate-300/80'
        }`}>
          <button
            onClick={() => setSubTab('family')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              subTab === 'family'
                ? isDark
                  ? 'bg-[#5E58E7] text-white shadow-xs'
                  : 'bg-white text-[#5E58E7] shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            A. Family & Friends ({people.length})
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              subTab === 'history'
                ? isDark
                  ? 'bg-[#5E58E7] text-white shadow-xs'
                  : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            B. Personal History ({events.length})
          </button>

          <button
            onClick={() => setSubTab('places')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              subTab === 'places'
                ? isDark
                  ? 'bg-[#5E58E7] text-white shadow-xs'
                  : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            C. Familiar Places ({places.length})
          </button>

          <button
            onClick={() => setSubTab('facts')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              subTab === 'facts'
                ? isDark
                  ? 'bg-[#5E58E7] text-white shadow-xs'
                  : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            D. Forgotten Facts & FAQs ({facts.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory entries..."
            className={`pl-8 pr-3 py-2 rounded-xl text-xs outline-none w-48 focus:w-60 transition-all border ${
              isDark
                ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-[#5E58E7]'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#5E58E7] shadow-2xs'
            }`}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION A: FAMILY & FRIENDS */}
      {/* ========================================================================= */}
      {subTab === 'family' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Family Members, Friends & Familiar Faces
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Profiles and photos verified for the patient's voice assistant. No fabricated memories.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPersonId(null);
                setPersonForm({
                  name: '',
                  relationship: '',
                  phone: '',
                  photo_url: '',
                  description: '',
                  notes: '',
                  visit_schedule: '',
                  voice_message_url: ''
                });
                setShowPersonModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Person
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {people
              .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.relationship.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((person) => {
                const isDeceased =
                  person.relationship?.toLowerCase().includes('late') ||
                  person.relationship?.toLowerCase().includes('deceased') ||
                  person.name?.toLowerCase().includes('late');

                return (
                  <div
                    key={person.id}
                    className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                          {person.name.charAt(0)}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{person.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {person.relationship}
                          </span>
                        </div>

                        {person.description && (
                          <p className="text-xs text-slate-300 mt-1">{person.description}</p>
                        )}
                        {person.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{person.notes}</p>
                        )}
                        {person.visit_schedule && (
                          <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Visit: {person.visit_schedule}
                          </p>
                        )}

                        {/* Call action or In Loving Memory tribute */}
                        <div className="mt-3 flex items-center gap-2">
                          {isDeceased ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/40">
                              <Heart className="w-3.5 h-3.5 fill-rose-500/50 text-rose-400" />
                              In Loving Memory
                            </span>
                          ) : person.phone ? (
                            <a
                              href={`tel:${person.phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {person.phone}
                            </a>
                          ) : null}

                          {person.voice_message_url && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                              Voice Message
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingPersonId(person.id);
                          setPersonForm({ ...person });
                          setShowPersonModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Edit Person"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePerson(person.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                        title="Delete Person"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION B: PERSONAL HISTORY */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Personal History & Life Story
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Core life events, career highlights, family milestones, and cherished accomplishments.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEventId(null);
                setEventForm({
                  title: '',
                  date_or_period: '',
                  category: 'career',
                  description: ''
                });
                setShowEventModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-950/40"
            >
              <Plus className="w-4 h-4" />
              Add Life Event
            </button>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                      {ev.date_or_period && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {ev.date_or_period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ev.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingEventId(ev.id);
                      setEventForm({ ...ev });
                      setShowEventModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION C: FAMILIAR PLACES */}
      {/* ========================================================================= */}
      {subTab === 'places' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Familiar Places & Safe Environments
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Home, parks, temples, and places the patient visits. Grounded references for navigation and reassurance.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPlaceId(null);
                setPlaceForm({
                  name: '',
                  address_or_location: '',
                  category: 'frequent',
                  description: '',
                  is_safe_zone: false
                });
                setShowPlaceModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              Add Place
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{place.name}</h4>
                      {place.is_safe_zone && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Safe Zone Home
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sky-400 font-medium mt-0.5">{place.address_or_location}</p>
                    {place.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{place.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingPlaceId(place.id);
                      setPlaceForm({ ...place });
                      setShowPlaceModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePlace(place.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION D: FREQUENTLY FORGOTTEN FACTS & FAQS */}
      {/* ========================================================================= */}
      {subTab === 'facts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Frequently Forgotten Facts & Verified FAQs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Commonly repeated questions, personal habits, item locations, and verified answers used by the AI assistant.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingFactId(null);
                setFactForm({
                  category: 'faq',
                  question_or_topic: '',
                  answer_or_detail: '',
                  is_verified: true,
                  notes: ''
                });
                setShowFactModal(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-950/40"
            >
              <Plus className="w-4 h-4" />
              Add Verified Fact
            </button>
          </div>

          <div className="space-y-3">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{fact.question_or_topic}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 uppercase">
                        {fact.category}
                      </span>
                      {fact.is_verified && (
                        <span className="px-2 py-0.2 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                      "{fact.answer_or_detail}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingFactId(fact.id);
                      setFactForm({ ...fact });
                      setShowFactModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteFact(fact.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Add / Edit Person Modal */}
      {showPersonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                {editingPersonId ? 'Edit Family Member / Friend' : 'Add Family Member / Friend'}
              </h4>
              <button onClick={() => setShowPersonModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePersonSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={personForm.name || ''}
                    onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={personForm.relationship || ''}
                    onChange={(e) => setPersonForm({ ...personForm, relationship: e.target.value })}
                    placeholder="e.g. Daughter or Late Husband"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    value={personForm.phone || ''}
                    onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                    placeholder="+91 98765 12345"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Visit Schedule</label>
                  <input
                    type="text"
                    value={personForm.visit_schedule || ''}
                    onChange={(e) => setPersonForm({ ...personForm, visit_schedule: e.target.value })}
                    placeholder="Tuesdays & Sundays"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description / Memory Cue</label>
                <input
                  type="text"
                  value={personForm.description || ''}
                  onChange={(e) => setPersonForm({ ...personForm, description: e.target.value })}
                  placeholder="Your loving elder daughter who brings flowers..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Photo URL (Optional)</label>
                <input
                  type="text"
                  value={personForm.photo_url || ''}
                  onChange={(e) => setPersonForm({ ...personForm, photo_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPersonModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  {editingPersonId ? 'Update Person' : 'Save Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Life Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                {editingEventId ? 'Edit Life Event' : 'Add Life Event'}
              </h4>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title || ''}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Professor at Miranda House or Houseboat in Srinagar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Period / Year</label>
                  <input
                    type="text"
                    value={eventForm.date_or_period || ''}
                    onChange={(e) => setEventForm({ ...eventForm, date_or_period: e.target.value })}
                    placeholder="1978 – 2010"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={eventForm.category || 'memory'}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="career">Career & Education</option>
                    <option value="family">Family Milestone</option>
                    <option value="travel">Travel & Holiday</option>
                    <option value="childhood">Childhood & Roots</option>
                    <option value="memory">General Memory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={eventForm.description || ''}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Rich narrative describing the memory..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  {editingEventId ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Place Modal */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {editingPlaceId ? 'Edit Familiar Place' : 'Add Familiar Place'}
              </h4>
              <button onClick={() => setShowPlaceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlaceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Place Name</label>
                <input
                  type="text"
                  value={placeForm.name || ''}
                  onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                  placeholder="e.g. Deer Park Hauz Khas or Arya Samaj Mandir"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={placeForm.address_or_location || ''}
                  onChange={(e) => setPlaceForm({ ...placeForm, address_or_location: e.target.value })}
                  placeholder="Hauz Khas, New Delhi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Familiar Details</label>
                <textarea
                  rows={2}
                  value={placeForm.description || ''}
                  onChange={(e) => setPlaceForm({ ...placeForm, description: e.target.value })}
                  placeholder="Your peaceful morning walking trail with the deer enclosure..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_safe_zone_chk"
                  checked={placeForm.is_safe_zone || false}
                  onChange={(e) => setPlaceForm({ ...placeForm, is_safe_zone: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="is_safe_zone_chk" className="text-xs text-slate-300 font-medium">
                  Mark as Safe Zone Anchor (e.g. Home residence)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  {editingPlaceId ? 'Update Place' : 'Save Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Memory Fact Modal */}
      {showFactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                {editingFactId ? 'Edit Verified Fact' : 'Add Verified Memory Fact / FAQ'}
              </h4>
              <button onClick={() => setShowFactModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFactSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={factForm.category || 'faq'}
                    onChange={(e) => setFactForm({ ...factForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="faq">Frequently Asked Question</option>
                    <option value="habit">Daily Habit</option>
                    <option value="name">Frequently Forgotten Name</option>
                    <option value="history">Personal History Detail</option>
                    <option value="detail">Important Personal Detail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Verified Status</label>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Caregiver Verified
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Question / Topic</label>
                <input
                  type="text"
                  value={factForm.question_or_topic || ''}
                  onChange={(e) => setFactForm({ ...factForm, question_or_topic: e.target.value })}
                  placeholder="e.g. Where are my spare keys? or Where did I work?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Verified Answer Spoken by Assistant</label>
                <textarea
                  rows={3}
                  value={factForm.answer_or_detail || ''}
                  onChange={(e) => setFactForm({ ...factForm, answer_or_detail: e.target.value })}
                  placeholder="Clear, factual, reassuring answer..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFactModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
                >
                  {editingFactId ? 'Update Fact' : 'Save Fact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
