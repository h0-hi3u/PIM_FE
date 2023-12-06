import { SearchSortModel } from './../../search-sort-state/search-sort.model';
import { DatePipe } from '@angular/common';
import { ProjectService } from './../../../shared/services/project.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faTrashCan,
  faAnglesRight,
  faAnglesLeft,
  faArrowUp,
  faArrowDown,
  faSpinner,
  // fa-spinner fa-pulse
} from '@fortawesome/free-solid-svg-icons';
import { Project } from 'src/shared/models/project';
import { ResponseDto } from 'src/shared/models/responseDto';
import { ToastService } from 'src/shared/services/toast.service';
import {
  selectCurrentIndexPage,
  selectSearchStatus,
  selectSearchText,
  selectSortCustomer,
  selectSortName,
  selectSortNumber,
  selectSortStartDate,
  selectSortStatus,
} from 'src/app/search-sort-state/search-sort.selector';
import { Store } from '@ngrx/store';
import {
  addSearchSort,
  clearSearchSort,
} from 'src/app/search-sort-state/search-sort.action';
import { catchError } from 'rxjs';
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  faTrashCan = faTrashCan;
  faAnglesRight = faAnglesRight;
  faAnglesLeft = faAnglesLeft;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faSpinner = faSpinner;
  show: boolean = false;
  isLoading: boolean = false;
  // isAccept : boolean = false;

  DES = 'DES';
  ASC = 'ASC';
  projects: Project[] = [];
  arrayTotalPage: number[] = [];
  listRemoveId: number[] = [];
  pageSize = 10;
  currentPageIndex = -1;
  sortNumber = '0';
  sortName = '0';
  sortStatus = '0';
  sortCustomer = '0';
  sortStartDate = '0';
  searchText = '';
  searchStatus = '0';
  errors : any;

  searchFrom = this.formBuilder.group({
    searchText: new FormControl(this.searchText),
    searchStatus: new FormControl(this.searchStatus),
  });

  initValueForm = this.searchFrom.value;

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    public datePipe: DatePipe,
    private store: Store
  ) {
    // this.store.select(selectSearchText).subscribe(value => this.searchText = value);
    // this.store.select(selectSearchStatus).subscribe(value => this.searchStatus = value);
    // this.store.select(selectSortNumber).subscribe(value => this.sortNumber = value);
    // this.store.select(selectSortName).subscribe(value => this.sortName = value);
    // this.store.select(selectSortStatus).subscribe((value) => this.sortStatus = value);
    // this.store.select(selectSortCustomer).subscribe(value => this.sortCustomer = value);
    // this.store.select(selectSortStartDate).subscribe(value => this.sortStartDate = value);
    // this.store.select(selectCurrentIndexPage).subscribe(value => this.currentPageIndex = value);
  }

  ngOnInit(): void {
    // this.loadLocalStorage();
    // this.movePage(this.currentPageIndex);
    this.movePage(1);
    localStorage.setItem('listRemoveId', JSON.stringify([]));
  }
  private loadLocalStorage() {
    this.store
      .select(selectSearchText)
      .subscribe((value) => (this.searchText = value));
    this.store
      .select(selectSearchStatus)
      .subscribe((value) => (this.searchStatus = value));
    this.store
      .select(selectSortNumber)
      .subscribe((value) => (this.sortNumber = value));
    this.store
      .select(selectSortName)
      .subscribe((value) => (this.sortName = value));
    this.store
      .select(selectSortStatus)
      .subscribe((value) => (this.sortStatus = value));
    this.store
      .select(selectSortCustomer)
      .subscribe((value) => (this.sortCustomer = value));
    this.store
      .select(selectSortStartDate)
      .subscribe((value) => (this.sortStartDate = value));
    this.store
      .select(selectCurrentIndexPage)
      .subscribe((value) => (this.currentPageIndex = value));
  }
  getArrayTotalPage(count: number) {
    for (let i = 1; i < count + 1; i++) {
      this.arrayTotalPage.push(i);
    }
  }
  //#region Search, reset search and sort, sort
  resetSearch() {
    this.searchFrom.reset(this.initValueForm);
    // this.store.dispatch(clearSearchSort());
    // this.loadLocalStorage();
    this.movePage(1);
  }
  searchProject() {
    this.resetSort();
    // const searchText : SearchSortModel = {name : "searchText", value : this.searchFrom.value.searchText || ''};
    // const searchStatus : SearchSortModel = {name : "searchStatus", value : this.searchFrom.value.searchStatus!};
    // const currentIndexPage : SearchSortModel = {name : "currentIndexPage", value : "1"};
    // this.store.dispatch(addSearchSort(searchText));
    // this.store.dispatch(addSearchSort(searchStatus));
    // this.store.dispatch(addSearchSort(currentIndexPage));
    // this.movePage(this.currentPageIndex);
    this.movePage(1);
  }
  sortByNumber() {
    if (this.sortNumber == '0') {
      this.resetSort();
    }
    this.sortNumber = this.sortNumber == this.ASC ? this.DES : this.ASC;
    this.movePage(1);
  }
  sortByName() {
    if (this.sortName == '0') {
      this.resetSort();
    }
    this.sortName = this.sortName == this.ASC ? this.DES : this.ASC;
    this.movePage(1);
  }
  sortByStatus() {
    if (this.sortStatus == '0') {
      this.resetSort();
    }
    this.sortStatus = this.sortStatus == this.ASC ? this.DES : this.ASC;
    this.movePage(1);
  }
  sortByCustomer() {
    if (this.sortCustomer == '0') {
      this.resetSort();
    }
    this.sortCustomer = this.sortCustomer == this.ASC ? this.DES : this.ASC;
    this.movePage(1);
  }
  sortByStartDate() {
    if (this.sortStartDate == '0') {
      this.resetSort();
    }
    this.sortStartDate = this.sortStartDate == this.ASC ? this.DES : this.ASC;
    this.movePage(1);
  }
  resetSort() {
    this.sortNumber = '0';
    this.sortName = '0';
    this.sortStatus = '0';
    this.sortCustomer = '0';
    this.sortStartDate = '0';
  }
  //#endregion

  //#region  Paging
  getListFromLocalStorage() {
    const listLocalStorage = localStorage.getItem('listRemoveId');
    if (listLocalStorage) {
      this.listRemoveId = JSON.parse(listLocalStorage);
    }
  }
  movePage(pageIndex: number) {
    this.isLoading = true;
    this.currentPageIndex = pageIndex;
    const searchValue = this.searchFrom.value;
    this.projects = [];
    this.arrayTotalPage = [];
    if (
      searchValue.searchStatus &&
      searchValue.searchText != null &&
      searchValue.searchText != undefined
    ) {
      this.projectService
        .pagingProject(
          this.pageSize,
          pageIndex,
          searchValue.searchText,
          searchValue.searchStatus,
          this.sortNumber,
          this.sortName,
          this.sortStatus,
          this.sortCustomer,
          this.sortStartDate
        )
        .subscribe({
          next: (res: ResponseDto) => {
            res.data.result.forEach((value: Project) => {
              if (value.startDate) {
                value.startDate = new Date(value.startDate);
              }
              if (value.endDate) {
                value.endDate = new Date(value.endDate);
              }
              this.projects.push(value);
            });
            this.getArrayTotalPage(res.data.totalPage);
            this.isLoading = false;
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {},
        });
    }
  }
  //#endregion

  //#region Remove project
  removeMultiple() {
    this.show = true;
    console.log('multiple');
    this.singleOrMultiple = 'multiple';
  }
  removeRange() {
    const listLocalStorage = localStorage.getItem('listRemoveId');
    if (listLocalStorage) {
      const list = JSON.parse(listLocalStorage);
      this.projectService
        .removeProjectRange(list)
        .subscribe((res: ResponseDto) => {
          if (res.isSuccess) {
            this.toastService.toast({
              title: `Status: ${res.isSuccess}!`,
              message: 'Delete range project success',
              type: 'success',
            });
            localStorage.setItem('listRemoveId', JSON.stringify([]));
            this.listRemoveId = [];
            this.movePage(this.currentPageIndex);
          } else {
            this.toastService.toast({
              title: `Status: ${res.isSuccess}!`,
              message: `${res.error}`,
              type: 'error',
            });
          }
        });
    }
  }

  clickProject(projectId?: number) {
    if (projectId) {
      const checkExist = this.listRemoveId.indexOf(projectId);
      if (checkExist !== -1) {
        this.listRemoveId.splice(checkExist, 1);
        localStorage.setItem('listRemoveId', JSON.stringify(this.listRemoveId));
      } else {
        this.listRemoveId.push(projectId);
        localStorage.setItem('listRemoveId', JSON.stringify(this.listRemoveId));
      }
    }
  }
  singleOrMultiple: string = '';
  id: any;
  removeSingle(id?: number) {
    this.show = true;
    this.singleOrMultiple = 'single';
    this.id = id;
  }
  removeProject(projectId?: number) {
    if (projectId) {
      this.projectService
        .removeProject(projectId)
        .subscribe((res: ResponseDto) => {
          if (res.isSuccess) {
            this.toastService.toast({
              title: `Status: ${res.isSuccess}!`,
              message: 'Delete project success',
              type: 'success',
            });
            const checkExist = this.listRemoveId.indexOf(projectId);
            if (checkExist !== -1) {
              this.listRemoveId.splice(checkExist, 1);
              localStorage.setItem(
                'listRemoveId',
                JSON.stringify(this.listRemoveId)
              );
            }
            this.movePage(this.currentPageIndex);
          } else {
            this.toastService.toast({
              title: `Status: ${res.isSuccess}!`,
              message: `${res.error}`,
              type: 'error',
            });
          }
        });
    }
    //this.movePage(1);
  }
  //#endregion
  // #region update project
  updateProject(projectId: number) {
    this.router.navigate([`project-update/${projectId}`]);
  }
  //#endregion
}
