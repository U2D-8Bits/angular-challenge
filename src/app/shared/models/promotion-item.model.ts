export interface PromotionItemModel {
  productId: number;
  productName: string;
  listPrice: number;
  quantity: number;
  promotionPrice: number;
  minPromotionQuantity: number;
  maxPromotionQuantity: number;
  minPromotionPrice: number;
  managerStatus: 'pendiente' | 'aprobada' | 'rechazada';
}
