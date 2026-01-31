import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReports, Report } from '@/contexts/ReportsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/data/burkinaFaso';
import { 
  Plus, 
  Settings, 
  LogOut, 
  Camera,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';
import logo from '@/assets/logo.png';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfilePhoto, logout } = useAuth();
  const { userReports } = useReports();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    
    // Convert to base64 for local storage
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfilePhoto(reader.result as string);
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status: keyof typeof REPORT_STATUSES) => {
    const statusInfo = REPORT_STATUSES[status];
    return (
      <Badge 
        variant="outline" 
        className={`bg-${statusInfo.color}/10 text-${statusInfo.color} border-${statusInfo.color}/30`}
        style={{ 
          backgroundColor: `hsl(var(--${statusInfo.color}) / 0.1)`,
          color: `hsl(var(--${statusInfo.color}))`,
          borderColor: `hsl(var(--${statusInfo.color}) / 0.3)`
        }}
      >
        {statusInfo.emoji} {statusInfo.label}
      </Badge>
    );
  };

  const stats = {
    total: userReports.length,
    pending: userReports.filter(r => r.status === 'PENDING').length,
    inProgress: userReports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: userReports.filter(r => r.status === 'RESOLVED').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold">Faso Propre</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/settings')}
              >
                <Settings size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="shadow-card animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarImage src={user.profilePhoto} alt={user.firstName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-md hover:bg-secondary/80 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  <Camera size={14} className="text-secondary-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} />
                  {user.city}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-status-pending">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-status-progress">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-status-resolved">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Résolus</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/new-report')}
            >
              <Plus size={24} />
              <span>Nouveau signalement</span>
            </Button>
            <Button 
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => navigate('/reports')}
            >
              <Clock size={24} />
              <span>Mes signalements</span>
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Numéros d'urgence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(REPORT_CATEGORIES).map(([key, category]) => (
              <div 
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.subcategories.length} types</p>
                  </div>
                </div>
                <a 
                  href={`tel:${category.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-1 text-primary hover:underline text-sm"
                >
                  <Phone size={14} />
                  {category.phone}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        {userReports.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Signalements récents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userReports.slice(0, 3).map((report) => {
                const category = REPORT_CATEGORIES[report.category];
                return (
                  <div 
                    key={report.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {report.photo && (
                      <img 
                        src={report.photo} 
                        alt="Report" 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {category?.icon} {report.subcategory}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.city}, {report.neighborhood}
                      </p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
