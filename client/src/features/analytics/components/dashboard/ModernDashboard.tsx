import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Receipt, 
  PieChart, 
  DollarSign,
  ArrowRight 
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '@/design-system/components/Card'; // Import CardHeader and CardContent
import Button from '@/design-system/components/Button';
import { designTokens } from '@/design-system';
import ModernSpendingChart from '@/features/analytics/components/charts/ModernSpendingChart'; // Import ModernSpendingChart
import ModernCategoryChart from '@/features/analytics/components/charts/ModernCategoryChart'; // Import ModernCategoryChart

const ModernDashboard = () => {
  const { t } = useTranslation('dashboard');
  
  const stats = [
    {
      title: t('stats.totalSpent'),
      value: '₪12,750',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'primary',
      gradient: designTokens.colors.gradients.primary
    },
    {
      title: t('stats.receiptsScanned'),
      value: '243',
      change: '+5%',
      trend: 'up',
      icon: Receipt,
      color: 'secondary',
      gradient: designTokens.colors.gradients.secondary
    },
    {
      title: t('stats.categoriesUsed'),
      value: '12',
      change: '0%',
      trend: 'neutral',
      icon: PieChart,
      color: 'success',
      gradient: designTokens.colors.gradients.ocean
    },
    {
      title: t('stats.savingsThisMonth'),
      value: '₪850',
      change: '+25%',
      trend: 'up',
      icon: TrendingUp,
      color: 'warning',
      gradient: designTokens.colors.gradients.sunset
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="glass" hover className="relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10"
                style={{ background: stat.gradient }}
              />
              <div className="relative p-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-3 rounded-lg bg-white/10">
                     <stat.icon className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">{stat.title}</p>
                     <h3 className="text-2xl font-bold">{stat.value}</h3>
                   </div>
                 </div>
                 <div className={`text-sm font-medium ${
                   stat.trend === 'up' ? 'text-green-500' :
                   stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                 }`}>
                   {stat.change}
                 </div>
               </div>
             </div>
           </Card>
         </motion.div>
       ))}
     </div>
     
     {/* Charts Section */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <motion.div
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.3 }}
       >
         <Card variant="glass">
           <CardHeader>
             <h2 className="text-xl font-semibold">{t('charts.spendingTrends')}</h2>
           </CardHeader>
           <CardContent>
             <ModernSpendingChart />
           </CardContent>
         </Card>
       </motion.div>
       
       <motion.div
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.4 }}
       >
         <Card variant="glass">
           <CardHeader>
             <h2 className="text-xl font-semibold">{t('charts.categoryBreakdown')}</h2>
           </CardHeader>
           <CardContent>
             <ModernCategoryChart />
           </CardContent>
         </Card>
       </motion.div>
     </div>
     
     {/* Quick Actions */}
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.5 }}
     >
       <Card variant="gradient">
         <CardContent className="p-8">
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
             <div>
               <h2 className="text-2xl font-bold mb-2">{t('quickActions.title')}</h2>
               <p className="text-gray-600">{t('quickActions.subtitle')}</p>
             </div>
             <div className="flex gap-4">
               <Button variant="gradient" leftIcon={<Receipt />}>
                 {t('quickActions.scanReceipt')}
               </Button>
               <Button variant="outline" rightIcon={<ArrowRight />}>
                 {t('quickActions.viewReports')}
               </Button>
             </div>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   </div>
 );
};

export default ModernDashboard;

// Modern Chart Components
// The chart components (ModernSpendingChart and ModernCategoryChart)
// should be in separate files as indicated by the work plan structure.
// They are imported above.
