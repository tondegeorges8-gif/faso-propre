import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/data/burkinaFaso';
import { ArrowLeft, MapPin, Calendar, Plus } from 'lucide-react';
const logo = '/logo.png';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userReports } = useReports();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getStatusStyle = (status: keyof typeof REPORT_STATUSES) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      IN_PROGRESS: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
      RESOLVED: 'bg-green-500/10 text-green-600 border-green-500/30',
      REJECTED: 'bg-red-500/10 text-red-600 border-red-500/30'
    };
    return styles[status] || styles.PENDING;
  };

  const sortedReports = [...userReports].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-lg font-bold">Mes signalements</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {sortedReports.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <MapPin size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Aucun signalement</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore effectué de signalement
              </p>
              <Button onClick={() => navigate('/new-report')} className="bg-primary">
                <Plus size={18} className="mr-2" />
                Faire un signalement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => {
              const category = REPORT_CATEGORIES[report.category];
              const status = REPORT_STATUSES[report.status];
              const date = new Date(report.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <Card key={report.id} className="shadow-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Photo */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                        <img 
                          src={report.photo} 
                          alt="Report" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-medium text-sm sm:text-base line-clamp-1">
                              {category?.icon} {report.subcategory}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs whitespace-nowrap ${getStatusStyle(report.status)}`}
                            >
                              {status.emoji} {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin size={12} />
                            {report.city}, {report.neighborhood}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Calendar size={12} />
                          {date}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => navigate('/new-report')}
        >
          <Plus size={24} />
        </Button>
      </main>
    </div>
  );
};

export default Reports;
