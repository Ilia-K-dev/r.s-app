import React from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Input } from '../../../shared/components/forms/Input';//correct
import { Minus, Plus } from 'lucide-react';//correct

const InventoryItem = ({ item, onUpdate }) => {
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(0, item.quantity + change);
    onUpdate({ ...item, quantity: newQuantity });
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Minus}
            onClick={() => handleQuantityChange(-1)}
          />
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate({ ...item, quantity: parseInt(e.target.value) || 0 })}
            className="w-20 text-center"
          />
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => handleQuantityChange(1)}
          />
        </div>
      </div>
    </Card>
  );
};