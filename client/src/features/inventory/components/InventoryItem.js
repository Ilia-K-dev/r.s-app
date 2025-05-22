import { Minus, Plus, Edit, Trash } from 'lucide-react';
import React from 'react';

import { Button } from '../../../shared/components/forms/Button';
import { Input } from '../../../shared/components/forms/Input';
import { Card } from '../../../shared/components/ui/Card';

const InventoryItem = ({ item, onUpdate, onDelete, onEdit }) => {
  const handleQuantityChange = change => {
    const newQuantity = Math.max(0, item.quantity + change);
    onUpdate({ ...item, quantity: newQuantity });
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-500">
            {item.quantity} {item.unit}
          </p>
        </div>
        <div className="flex items-center space-x-2">
           {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              icon={Edit}
              onClick={() => onEdit(item)}
            />
          )}
          <Button
            size="sm"
            variant="secondary"
            icon={Minus}
            onClick={() => handleQuantityChange(-1)}
          />
          <Input
            type="number"
            value={item.quantity}
            onChange={e => onUpdate({ ...item, quantity: parseInt(e.target.value) || 0 })}
            className="w-20 text-center"
          />
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => handleQuantityChange(1)}
          />
           {onDelete && (
            <Button
              size="sm"
              variant="danger"
              icon={Trash}
              onClick={() => onDelete(item.id)}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default InventoryItem;
