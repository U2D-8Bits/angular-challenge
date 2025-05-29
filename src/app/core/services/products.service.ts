import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ProductModel } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient);
  private readonly apiUrl: string = environment.apiUrl;

  // Método para obtener todos los productos
  getAllProducts(): Observable<ProductModel[]>{
    return this.http.get<ProductModel[]>(`${this.apiUrl}/products`);
  }

}
