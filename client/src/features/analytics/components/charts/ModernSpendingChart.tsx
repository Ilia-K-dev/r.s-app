import React from 'react';
import { 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis, 
 Tooltip, 
 ResponsiveContainer,
 CartesianGrid 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { designTokens } from '@/design-system';
import { formatHebrewCurrency } from '@/utils/formatters/hebrew';

const ModernSpendingChart = () => {
 const { t, i18n } = useTranslation();
 const isRTL = i18n.language === 'he';
 
 const data = [
   { month: 'ינו', amount: 3000 },
   { month: 'פבר', amount: 3800 },
   { month: 'מרץ', amount: 3200 },
   { month: 'אפר', amount: 4200 },
   { month: 'מאי', amount: 3600 },
   { month: 'יונ', amount: 4500 },
 ];
 
 return (
   <div className="h-80">
     <ResponsiveContainer width="100%" height="100%">
       <AreaChart 
         data={data}
         margin={{ 
           top: 10, 
           right: isRTL ? 0 : 30, 
           left: isRTL ? 30 : 0, 
           bottom: 0 
         }}
       >
         <defs>
           <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
             <stop offset="5%" stopColor={designTokens.colors.primary[500]} stopOpacity={0.3}/>
             <stop offset="95%" stopColor={designTokens.colors.primary[500]} stopOpacity={0}/>
           </linearGradient>
           <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor={designTokens.colors.primary[500]} />
             <stop offset="100%" stopColor={designTokens.colors.secondary[500]} />
           </linearGradient>
         </defs>
         <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
         <XAxis 
           dataKey="month" 
           axisLine={false}
           tickLine={false}
           dy={10}
           reversed={isRTL}
         />
         <YAxis 
           axisLine={false}
           tickLine={false}
           dx={isRTL ? 10 : -10} // Adjusted dx for RTL
           tickFormatter={(value) => `₪${value}`} // Keep existing formatter or use Hebrew one if available
           reversed={isRTL}
         />
         <Tooltip 
           contentStyle={{ 
             backgroundColor: 'rgba(255, 255, 255, 0.95)',
             border: '1px solid rgba(0, 0, 0, 0.1)',
             borderRadius: '8px',
             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
             padding: '12px'
           }}
           formatter={(value) => [formatHebrewCurrency(value), t('charts.spendingTrends.yAxis')]} // Keep existing formatter
         />
         <Area
           type="monotone"
           dataKey="amount"
           stroke="url(#lineGradient)"
           fill="url(#areaGradient)"
           strokeWidth={3}
           dot={{ r: 6, strokeWidth: 2 }}
           activeDot={{ r: 8, strokeWidth: 2 }}
         />
       </AreaChart>
     </ResponsiveContainer>
   </div>
 );
};

export default ModernSpendingChart;
