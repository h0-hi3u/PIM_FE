import { ResponseDto } from './../models/reponseDto';

import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment ';
import { ProjectCreate } from '../models/projectCreate';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private urlGetAll = 'projects';
  private urlSearch = 'projects/search';
  private urlPaging = 'projects/paging';
  private urlCheckExist = 'projects/checkProjectNumber';
  private urlRemoveRange = 'projects/removeRange';
  constructor(private http: HttpClient) {}

  public convertDateProject(p: Project): Project {
    if (p.startDate) {
      p.startDate = new Date(p.startDate);
    }
    if (p.endDate) {
      p.endDate = new Date(p.endDate);
    }
    return p;
  }

  public getProject(): Project[] {
    let listProject: Project[] = [];
    this.http
      .get<ResponseDto>(`${environment.urlApi}/${this.urlGetAll}`)
      .subscribe((res: ResponseDto) =>
        res.data.forEach((value: Project) => {
          let project = this.convertDateProject(value);
          listProject.push(project);
        })
      );
    return listProject;
  }
  public getProjectUpdate(projectId : number) : Observable<ResponseDto> {
    return this.http.get<ResponseDto>(`${environment.urlApi}/${this.urlGetAll}/${projectId}`);
  }
  public createProject(project: ProjectCreate): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(
      `${environment.urlApi}/${this.urlGetAll}`,
      project
    );
  }

  public updateProject(project: Project) : Observable<ResponseDto> {
    return this.http.put<ResponseDto>(`${environment.urlApi}/${this.urlGetAll}`, project);
  }
  public removeProject(id: number) : Observable<ResponseDto> {
    return this.http.delete<ResponseDto>(`${environment.urlApi}/${this.urlGetAll}/${id}`);
  }
  public removeProjectRange(list : number[]) : Observable<ResponseDto> {
    return this.http.post<ResponseDto>(`${environment.urlApi}/${this.urlRemoveRange}`, list);
  }
  // public searchProject(searchText: string, searchStatus: string): Project[] {
  //   let listProject: Project[] = [];
  //   this.http
  //     .get<ResponseDto>(
  //       `${environment.urlApi}/${this.urlSearch}?searchText=${searchText}&searchStatus=${searchStatus}`
  //     )
  //     .subscribe((res: ResponseDto) =>
  //       res.data.forEach((value: Project) => {
  //         let project = this.convertDateProject(value);
  //         listProject.push(project);
  //       })
  //     );
  //   return listProject;
  // }

  public pagingProject(
    pageSize: number,
    pageIndex: number,
    searchText: string,
    searchStatus: string,
    sortNumber: string,
    sortName: string,
    sortStatus: string,
    sortCustomer: string, 
    sortStartDate: string,
  ): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(
      `${environment.urlApi}/${this.urlPaging}?pageSize=${pageSize}&pageIndex=${pageIndex}&searchText=${searchText}&searchStatus=${searchStatus}&sortNumber=${sortNumber}&sortName=${sortName}&sortStatus=${sortStatus}&sortCustomer=${sortCustomer}&sortStartDate=${sortStartDate}`
    );
  }

  public checkProjectNumber(projectNumber: number): Observable<boolean> {
    return this.http
      .get<boolean>(
        `${environment.urlApi}/${this.urlCheckExist}?projectNumber=${projectNumber}`
      )
  }
}
