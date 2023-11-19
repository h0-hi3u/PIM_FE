import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment ';
import { ResponseDto } from '../models/reponseDto';
@Injectable({
    providedIn: 'root'
}) 
export class GroupService {
  private url = 'group/getAllId';

  constructor(private http: HttpClient) {}

  public getAllId(): Number[] {
    const list: Number[] = [];
    this.http
      .get<ResponseDto>(`${environment.urlApi}/${this.url}`)
      .subscribe((res: ResponseDto) => {
        res.data.forEach((element : number) => {
            list.push(element);
        });
      });
    return list;
  }
}
