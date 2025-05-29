import { Injectable, inject } from '@angular/core';
import { PromotionItemModel } from '../../shared/models';
import { StorageService } from './storage.service';


export type PromotionListStatus = 'EDICION' | 'APROBACION' | 'APROBADO'

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {

  private storage = inject(StorageService);
  private readonly PROMO_LIST_KEY = 'promotion_list';
  private readonly PROMO_STATUS_KEY = 'promotion_list_status';


  // Método para obtener la lista de promociones desde el LocalStorage
  getPromotionList(): PromotionItemModel[]{
    const data = localStorage.getItem('promotion_list');
    return data ? JSON.parse(data) : [];
  }

  // Método para guardar la lista de promociones
  savePromotionList(list: PromotionItemModel[]) {
    localStorage.setItem('promotion_list', JSON.stringify(list));
  }

  // Método para Eliminar la lista de promociones
  clearPromotionList(): void {
    this.storage.removeItem(this.PROMO_LIST_KEY);
    this.storage.removeItem(this.PROMO_STATUS_KEY);
  }

  // Método para obtener el estado de la lista (EDICION | APROBACION | APROBADO)
  getPromotionStatus(): PromotionListStatus{
    return (
      this.storage.getItem(this.PROMO_STATUS_KEY) as PromotionListStatus
    ) || 'EDICION';
  }

  // Método para guardar el estado de la lista
  setPromotionStatus(status: PromotionListStatus): void {
    this.storage.setItem(this.PROMO_STATUS_KEY, status);
  }

}
