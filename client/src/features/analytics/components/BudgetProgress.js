import React from 'react'; //correct

import { Card } from '../../../shared/components/ui/Card'; //correct

export const BudgetProgress = ({ categories }) => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Budget Progress</h3>
      <div className="space-y-4">
        {categories.map(category => {
          const percentage = (category.spent / category.budget) * 100;
          const color = percentage > 90 ? 'red' : percentage > 70 ? 'yellow' : 'green';

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-sm text-gray-500">
                  ${category.spent} / ${category.budget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full bg-${color}-500`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
