 import React, { useState, useEffect } from 'react';
 import SignedImage from '@/components/ui/SignedImage';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { supabase } from '@/integrations/supabase/client';
 import { sendWebhook } from '@/lib/webhook';
 import { INSTITUTIONS, REPORT_STATUSES, type InstitutionId } from '@/data/institutions';
 import { useToast } from '@/hooks/use-toast';
 import { 
   MapPin, 
   Calendar, 
   CheckCircle, 
   Clock, 
   XCircle,
   RefreshCw,
   Filter
 } from 'lucide-react';
 
 interface InstitutionSignalement {
   id: string;
   subcategory: string;
   ville: string;
   quartier: string | null;
   secteur: string | null;
   description: string | null;
   photo_url: string | null;
   status: string;
   created_at: string;
   nom_complet: string;
   latitude: number | null;
   longitude: number | null;
 }
 
 interface InstitutionDashboardProps {
   institutionId: InstitutionId;
 }
 
 const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ institutionId }) => {
   const [signalements, setSignalements] = useState<InstitutionSignalement[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const { toast } = useToast();
 
   const institution = INSTITUTIONS[institutionId];
 
   const fetchSignalements = async () => {
     setIsLoading(true);
     try {
       let query = supabase
         .from('signalements')
         .select('*')
         .eq('category', institutionId)
         .order('created_at', { ascending: false });
 
       if (statusFilter !== 'all') {
         query = query.eq('status', statusFilter);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
       setSignalements((data || []) as InstitutionSignalement[]);
     } catch (error) {
       console.error('Error fetching signalements:', error);
       toast({
         title: 'Erreur',
         description: 'Impossible de charger les signalements',
         variant: 'destructive',
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchSignalements();
   }, [institutionId, statusFilter]);
 
   const updateStatus = async (signalementId: string, newStatus: string) => {
     try {
       const { error } = await supabase
         .from('signalements')
         .update({ status: newStatus })
         .eq('id', signalementId);
 
       if (error) throw error;
 
       toast({
         title: 'Statut mis à jour',
         description: `Le signalement a été marqué comme "${REPORT_STATUSES[newStatus as keyof typeof REPORT_STATUSES]?.label}"`,
       });
 
       fetchSignalements();
     } catch (error) {
       console.error('Error updating status:', error);
       toast({
         title: 'Erreur',
         description: 'Impossible de mettre à jour le statut',
         variant: 'destructive',
       });
     }
   };
 
   const stats = {
     total: signalements.length,
     pending: signalements.filter(s => s.status === 'PENDING').length,
     inProgress: signalements.filter(s => s.status === 'IN_PROGRESS').length,
     resolved: signalements.filter(s => s.status === 'RESOLVED').length,
   };
 
   const getStatusBadge = (status: string) => {
     const statusInfo = REPORT_STATUSES[status as keyof typeof REPORT_STATUSES];
     if (!statusInfo) return null;
     return (
       <Badge variant="outline">
         {statusInfo.emoji} {statusInfo.label}
       </Badge>
     );
   };
 
   return (
     <div className="space-y-6">
       {/* Institution Header */}
       <Card className="shadow-card" style={{ borderColor: institution?.couleur }}>
         <CardHeader className="pb-2">
           <div className="flex items-center gap-3">
             <span className="text-4xl">{institution?.icon}</span>
             <div>
               <CardTitle className="text-xl">{institution?.nom}</CardTitle>
               <p className="text-sm text-muted-foreground">Tableau de bord institutionnel</p>
             </div>
           </div>
         </CardHeader>
       </Card>
 
       {/* Stats */}
       <div className="grid grid-cols-4 gap-3">
         <Card className="shadow-card">
           <CardContent className="pt-4 pb-4 text-center">
             <p className="text-2xl font-bold text-primary">{stats.total}</p>
             <p className="text-xs text-muted-foreground">Total</p>
           </CardContent>
         </Card>
         <Card className="shadow-card">
           <CardContent className="pt-4 pb-4 text-center">
             <p className="text-2xl font-bold text-status-pending">{stats.pending}</p>
             <p className="text-xs text-muted-foreground">Attente</p>
           </CardContent>
         </Card>
         <Card className="shadow-card">
           <CardContent className="pt-4 pb-4 text-center">
             <p className="text-2xl font-bold text-status-progress">{stats.inProgress}</p>
             <p className="text-xs text-muted-foreground">En cours</p>
           </CardContent>
         </Card>
         <Card className="shadow-card">
           <CardContent className="pt-4 pb-4 text-center">
             <p className="text-2xl font-bold text-status-resolved">{stats.resolved}</p>
             <p className="text-xs text-muted-foreground">Résolus</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Filter & Refresh */}
       <Card className="shadow-card">
         <CardContent className="pt-4 pb-4">
           <div className="flex items-center gap-3">
             <Filter size={18} className="text-muted-foreground" />
             <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="flex-1">
                 <SelectValue placeholder="Filtrer par statut" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Tous les signalements</SelectItem>
                 <SelectItem value="PENDING">En attente</SelectItem>
                 <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                 <SelectItem value="RESOLVED">Résolus</SelectItem>
                 <SelectItem value="REJECTED">Rejetés</SelectItem>
               </SelectContent>
             </Select>
             <Button variant="outline" size="icon" onClick={fetchSignalements}>
               <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
             </Button>
           </div>
         </CardContent>
       </Card>
 
       {/* Signalements List */}
       <div className="space-y-4">
         {isLoading ? (
           <div className="flex justify-center py-8">
             <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
           </div>
         ) : signalements.length === 0 ? (
           <Card className="shadow-card">
             <CardContent className="py-8 text-center">
               <p className="text-muted-foreground">Aucun signalement pour le moment</p>
             </CardContent>
           </Card>
         ) : (
           signalements.map((signalement) => (
             <Card key={signalement.id} className="shadow-card">
               <CardContent className="pt-4 pb-4">
                 <div className="flex gap-4">
                    {signalement.photo_url && (
                      <SignedImage 
                        bucket="signalements-photos"
                        path={signalement.photo_url}
                        alt="Signalement" 
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                   <div className="flex-1 space-y-2">
                     <div className="flex items-start justify-between">
                       <div>
                         <h3 className="font-semibold">{signalement.subcategory}</h3>
                         <p className="text-sm text-muted-foreground flex items-center gap-1">
                           <MapPin size={14} />
                           {signalement.ville}, {signalement.quartier || signalement.secteur}
                         </p>
                       </div>
                       {getStatusBadge(signalement.status)}
                     </div>
                     
                     {signalement.description && (
                       <p className="text-sm text-muted-foreground line-clamp-2">
                         {signalement.description}
                       </p>
                     )}
 
                     <div className="flex items-center justify-between pt-2">
                       <p className="text-xs text-muted-foreground flex items-center gap-1">
                         <Calendar size={12} />
                         {new Date(signalement.created_at).toLocaleDateString('fr-FR')}
                       </p>
 
                       <div className="flex gap-2">
                         {signalement.status === 'PENDING' && (
                           <Button 
                             size="sm" 
                             variant="outline"
                             onClick={() => updateStatus(signalement.id, 'IN_PROGRESS')}
                           >
                             <Clock size={14} className="mr-1" />
                             Prendre en charge
                           </Button>
                         )}
                         {signalement.status === 'IN_PROGRESS' && (
                           <>
                             <Button 
                               size="sm" 
                               variant="default"
                               onClick={() => updateStatus(signalement.id, 'RESOLVED')}
                             >
                               <CheckCircle size={14} className="mr-1" />
                               Résolu
                             </Button>
                             <Button 
                               size="sm" 
                               variant="destructive"
                               onClick={() => updateStatus(signalement.id, 'REJECTED')}
                             >
                               <XCircle size={14} className="mr-1" />
                               Rejeter
                             </Button>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           ))
         )}
       </div>
     </div>
   );
 };
 
 export default InstitutionDashboard;