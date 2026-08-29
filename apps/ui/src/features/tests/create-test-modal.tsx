import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ApiCompetency, ApiSubCompetency, ApiUser } from './tests.api';

const PAGE_SIZE = 4;

export interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  competencies: ApiCompetency[];
  subCompetencies: ApiSubCompetency[];
  users: ApiUser[];
  evaluators: ApiUser[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onConfirm: (testData: {
    assessmentSituation: string;
    competencyId: number;
    subcompetencyIds: number[];
    userIds: number[];
    evaluatorIds: number[];
  }) => void;
}

export function CreateTestModal({
  isOpen,
  onClose,
  competencies = [],
  subCompetencies = [],
  users = [],
  evaluators = [],
  isLoading = false,
  isSubmitting = false,
  onConfirm,
}: CreateTestModalProps) {
  // Descrizione contesto
  const [assessmentSituation, setAssessmentSituation] = useState(
    'Valutazione delle competenze pratiche e teoriche'
  );

  // Stato selezione competenza
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string>('');

  // Stati selezioni ID
  const [selectedSubcompetencyIds, setSelectedSubcompetencyIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<number[]>([]);

  // Stati ricerca
  const [subSearch, setSubSearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [evaluatorSearch, setEvaluatorSearch] = useState<string>('');

  // Stati paginazione
  const [subPage, setSubPage] = useState<number>(1);
  const [userPage, setUserPage] = useState<number>(1);
  const [evaluatorPage, setEvaluatorPage] = useState<number>(1);

  // Filtro Sottocompetenze
  const allSubcompetenciesForCompetency = useMemo(() => {
    if (!selectedCompetencyId) return [];
    return subCompetencies.filter(
      (sub) => sub.competency_id === Number(selectedCompetencyId)
    );
  }, [selectedCompetencyId, subCompetencies]);

  const filteredSubcompetencies = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return allSubcompetenciesForCompetency;
    return allSubcompetenciesForCompetency.filter((sub) =>
      sub.title.toLowerCase().includes(q)
    );
  }, [allSubcompetenciesForCompetency, subSearch]);

  const totalSubPages = Math.ceil(filteredSubcompetencies.length / PAGE_SIZE) || 1;
  const paginatedSubcompetencies = useMemo(() => {
    const start = (subPage - 1) * PAGE_SIZE;
    return filteredSubcompetencies.slice(start, start + PAGE_SIZE);
  }, [filteredSubcompetencies, subPage]);

  // Filtro Utenti
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const totalUserPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, userPage]);

  // Filtro Valutatori
  const filteredEvaluators = useMemo(() => {
    const q = evaluatorSearch.trim().toLowerCase();
    if (!q) return evaluators;
    return evaluators.filter(
      (ev) => ev.name.toLowerCase().includes(q) || ev.email.toLowerCase().includes(q)
    );
  }, [evaluators, evaluatorSearch]);

  const totalEvaluatorPages = Math.ceil(filteredEvaluators.length / PAGE_SIZE) || 1;
  const paginatedEvaluators = useMemo(() => {
    const start = (evaluatorPage - 1) * PAGE_SIZE;
    return filteredEvaluators.slice(start, start + PAGE_SIZE);
  }, [filteredEvaluators, evaluatorPage]);

  // Reset al cambio competenza
  const handleCompetencyChange = (value: string) => {
    setSelectedCompetencyId(value);
    setSelectedSubcompetencyIds([]);
    setSubSearch('');
    setSubPage(1);
  };

  // Toggle selezioni
  const toggleSubcompetency = (id: number) => {
    setSelectedSubcompetencyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisibleSubcompetencies = () => {
    const visibleIds = paginatedSubcompetencies.map((s) => s.id);
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedSubcompetencyIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedSubcompetencyIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedSubcompetencyIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisibleUsers = () => {
    const visibleIds = paginatedUsers.map((u) => u.id);
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedUserIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedUserIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const toggleEvaluator = (id: number) => {
    setSelectedEvaluatorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisibleEvaluators = () => {
    const visibleIds = paginatedEvaluators.map((e) => e.id);
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedEvaluatorIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedEvaluatorIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedEvaluatorIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const isConfirmDisabled =
    !selectedCompetencyId ||
    selectedSubcompetencyIds.length === 0 ||
    selectedUserIds.length === 0 ||
    selectedEvaluatorIds.length === 0 ||
    isSubmitting;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;

    onConfirm({
      assessmentSituation: assessmentSituation.trim() || 'Assessment di valutazione',
      competencyId: Number(selectedCompetencyId),
      subcompetencyIds: selectedSubcompetencyIds,
      userIds: selectedUserIds,
      evaluatorIds: selectedEvaluatorIds,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[92vw] max-h-[90vh] flex flex-col p-8 gap-6 overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Titolo conforme a modale.png */}
        <DialogHeader className="p-0">
          <DialogTitle className="text-2xl font-bold text-sky-600">
            Creazione Test
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <p className="text-sm text-slate-500">Caricamento dati dal server...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-7">
            {/* 1. Seleziona la competenza */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800">
                Seleziona la competenza
              </Label>
              <Select
                value={selectedCompetencyId}
                onValueChange={handleCompetencyChange}
              >
                <SelectTrigger className="w-full h-10 bg-white border-slate-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="-- Seleziona una competenza --" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {competencies.map((comp) => (
                    <SelectItem key={comp.id} value={String(comp.id)}>
                      <span className="font-medium text-slate-900">{comp.title}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        (Peso: {comp.weight}, Soglia: {comp.threshold})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Seleziona le sottocompetenze */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-semibold text-slate-800">
                  Seleziona le sottocompetenze
                </Label>

                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    value={subSearch}
                    disabled={!selectedCompetencyId}
                    onChange={(e) => {
                      setSubSearch(e.target.value);
                      setSubPage(1);
                    }}
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="w-10 text-center py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          disabled={paginatedSubcompetencies.length === 0}
                          checked={
                            paginatedSubcompetencies.length > 0 &&
                            paginatedSubcompetencies.every((s) =>
                              selectedSubcompetencyIds.includes(s.id)
                            )
                          }
                          onChange={toggleAllVisibleSubcompetencies}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-2">
                        Titolo
                      </TableHead>
                      <TableHead className="w-16 text-center text-xs font-semibold text-slate-700 py-2">
                        Peso
                      </TableHead>
                      <TableHead className="w-16 text-center text-xs font-semibold text-slate-700 py-2">
                        Soglia
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!selectedCompetencyId ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-20 text-center text-xs text-slate-400">
                          Seleziona prima una competenza
                        </TableCell>
                      </TableRow>
                    ) : paginatedSubcompetencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-20 text-center text-xs text-slate-400">
                          Nessuna sottocompetenza trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSubcompetencies.map((sub) => {
                        const isSelected = selectedSubcompetencyIds.includes(sub.id);
                        return (
                          <TableRow
                            key={sub.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="cursor-pointer hover:bg-slate-50 text-xs"
                            onClick={() => toggleSubcompetency(sub.id)}
                          >
                            <TableCell className="text-center py-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleSubcompetency(sub.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-slate-900 py-2">
                              {sub.title}
                            </TableCell>
                            <TableCell className="text-center text-slate-600 py-2">
                              {sub.weight}
                            </TableCell>
                            <TableCell className="text-center text-slate-600 py-2">
                              {sub.threshold}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {selectedCompetencyId && filteredSubcompetencies.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>
                      {selectedSubcompetencyIds.length} selezionat{selectedSubcompetencyIds.length === 1 ? 'a' : 'e'} di {filteredSubcompetencies.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>
                        {subPage}/{totalSubPages}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={subPage <= 1}
                        onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={subPage >= totalSubPages}
                        onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Utenti */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-semibold text-slate-800">
                  Utenti
                </Label>

                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca utente..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="w-10 text-center py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          checked={
                            paginatedUsers.length > 0 &&
                            paginatedUsers.every((u) => selectedUserIds.includes(u.id))
                          }
                          onChange={toggleAllVisibleUsers}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-2">
                        Nome
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-2">
                        Email
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-xs text-slate-400">
                          Nessun utente trovato
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <TableRow
                            key={user.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="cursor-pointer hover:bg-slate-50 text-xs"
                            onClick={() => toggleUser(user.id)}
                          >
                            <TableCell className="text-center py-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleUser(user.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-slate-900 py-2">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-slate-600 py-2">
                              {user.email}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {filteredUsers.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>
                      {selectedUserIds.length} selezionat{selectedUserIds.length === 1 ? 'o' : 'i'} di {filteredUsers.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>
                        {userPage}/{totalUserPages}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={userPage >= totalUserPages}
                        onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Valutatori */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-semibold text-slate-800">
                  Valutatori
                </Label>

                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca valutatore..."
                    value={evaluatorSearch}
                    onChange={(e) => {
                      setEvaluatorSearch(e.target.value);
                      setEvaluatorPage(1);
                    }}
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="w-10 text-center py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          checked={
                            paginatedEvaluators.length > 0 &&
                            paginatedEvaluators.every((ev) =>
                              selectedEvaluatorIds.includes(ev.id)
                            )
                          }
                          onChange={toggleAllVisibleEvaluators}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-2">
                        Nome
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-2">
                        Email
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvaluators.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-xs text-slate-400">
                          Nessun valutatore trovato
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEvaluators.map((ev) => {
                        const isSelected = selectedEvaluatorIds.includes(ev.id);
                        return (
                          <TableRow
                            key={ev.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="cursor-pointer hover:bg-slate-50 text-xs"
                            onClick={() => toggleEvaluator(ev.id)}
                          >
                            <TableCell className="text-center py-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleEvaluator(ev.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-slate-900 py-2">
                              {ev.name}
                            </TableCell>
                            <TableCell className="text-slate-600 py-2">
                              {ev.email}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {filteredEvaluators.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>
                      {selectedEvaluatorIds.length} selezionat{selectedEvaluatorIds.length === 1 ? 'o' : 'i'} di {filteredEvaluators.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>
                        {evaluatorPage}/{totalEvaluatorPages}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={evaluatorPage <= 1}
                        onClick={() => setEvaluatorPage((p) => Math.max(1, p - 1))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={evaluatorPage >= totalEvaluatorPages}
                        onClick={() => setEvaluatorPage((p) => Math.min(totalEvaluatorPages, p + 1))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer come da mock: "annulla" e "conferma" */}
        <DialogFooter className="pt-3 border-t border-slate-100 flex flex-row justify-end gap-3 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-5 border-slate-300 hover:bg-slate-100 text-slate-700 h-9 text-xs"
          >
            annulla
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 h-9 text-xs flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            conferma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
