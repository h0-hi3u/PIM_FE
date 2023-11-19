import { Component, Input, OnInit } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ProjectService } from 'src/shared/services/project.service';
import { ProjectCreate } from 'src/shared/models/projectCreate';
import { ResponseDto } from 'src/shared/models/reponseDto';
import { GroupService } from 'src/shared/services/group.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Employee } from 'src/shared/models/employee';
import { EmployeeService } from 'src/shared/services/employee.service';
import { ToastService } from 'src/shared/services/toast.service';
import { inRange } from 'src/shared/validators/inRange';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Project } from 'src/shared/models/project';
import { EmployeeDropdown } from 'src/shared/models/employeeDropdown';

@Component({
  standalone: true,
  selector: 'app-project-new',
  templateUrl: './project-new.component.html',
  styleUrls: ['./project-new.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NgMultiSelectDropDownModule],
})
export class ProjectNewComponent implements OnInit {
  listGroupId: Number[] = this.groupService.getAllId();
  isUpdate = this.route.url.includes('project-update');
  listEmployeeAll: Employee[] = [];
  validForm: boolean = true;
  formMessage: string = '';
  isExistProjectNumber: boolean = false;
  updateId = '';
  project = new Project();

  // Test
  dropdownList: EmployeeDropdown[] = [];
  selectedItems: EmployeeDropdown[] = [];
  dropdownSettings: IDropdownSettings = {};
  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private groupService: GroupService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private route: Router
  ) {}
  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'visaFullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true,
      maxHeight: 100,
    };
    this.employeeService.getAll().subscribe((res: ResponseDto) => {
      res.data.forEach((element: Employee) => {
        this.listEmployeeAll.push(element);
        this.dropdownList = this.employeeService.employeeToEmployeeDropdown(
          this.listEmployeeAll
        );
      });
    });
    if (this.isUpdate) {
      this.updateId = this.route.url.slice('/project-update/'.length);
      this.projectService
        .getProjectUpdate(parseInt(this.updateId))
        .subscribe((res: ResponseDto) => {
          this.project = res.data;
          this.selectedItems = this.employeeService.employeeToEmployeeDropdown(
            this.project.employees
          );
          this.getForm.projectNumber.setValue(
            this.project.projectNumber!.toString()
          );
          this.getForm.projectName.setValue(this.project.name);
          this.getForm.customer.setValue(this.project.customer);
          this.getForm.groupId.setValue(this.project.groupId!.toString());
          this.getForm.status.setValue(this.project.status);
          this.getForm.startDate.setValue(
            new Date(this.project.startDate).toISOString().split('T')[0]
          );
          this.getForm.endDate.setValue(
            new Date(this.project.endDate).toISOString().split('T')[0]
          );
        });
    }
  }

  //#region "Form and validate form"
  createProjectForm = this.formBuilder.group({
    projectNumber: new FormControl('', [Validators.required, inRange(1, 999)]),
    projectName: new FormControl('', [
      Validators.maxLength(10),
      Validators.required,
    ]),
    customer: new FormControl('', [Validators.required]),
    groupId: new FormControl('', [Validators.required]),
    member: new FormControl([], [Validators.required]),
    status: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl(''),
  });
  get getForm() {
    return this.createProjectForm.controls;
  }
  // checkDate(start? : string, end : string) : boolean {
  //   if(end && start) {
  //     const startDate = new Date(start);
  //     const endDate = new Date(end);
  //     return endDate > startDate;
  //   }
  //   return true;
  // }
  IsValidForm(): boolean {
    let check =
      this.getForm.projectNumber.value !== '' &&
      this.getForm.projectName.valid &&
      this.getForm.customer.valid &&
      this.getForm.groupId.valid &&
      this.getForm.status.valid &&
      this.getForm.startDate.valid
      // && this.checkDate(this.getForm.startDate.value, this.getForm.endDate.value);
    if (!check) {
      this.formMessage = 'Please enter all the mandatory field(*)';
      this.validForm = check;
      return check;
    } else {
      if (this.getForm['projectNumber'].errors) {
        this.formMessage =
          'Project number in range :' +
          JSON.stringify(this.getForm['projectNumber'].errors['inRange']);
        check = false;
      }
    }
    this.validForm = check;
    return check;
  }
  hiddenMessage() {
    this.validForm = !this.validForm;
  }
  //#endregion "From and validate form"
  createProject() {
    const valid = this.IsValidForm();
    if (valid) {
      const valueForm = this.createProjectForm.value;
      const project = new ProjectCreate();

      project.groupId = Number(valueForm.groupId);
      project.projectNumber = Number(valueForm.projectNumber);
      project.name = String(valueForm.projectName);
      project.customer = String(valueForm.customer);
      const employees = this.employeeService.employeeDropdownToEmployee(this.selectedItems, this.listEmployeeAll);
      project.employees = employees;
      project.status = String(valueForm.status);
      if (valueForm.startDate != undefined) {
        project.startDate = new Date(valueForm.startDate);
      }

      if (valueForm.endDate != undefined) {
        project.endDate = new Date(valueForm.endDate);
      }

      this.projectService
        .createProject(project)
        .subscribe((res: ResponseDto) => {
          if (res.isSuccess) {
            this.route.navigate(['project-list']);
            this.toastService.toast({
              title: `Status: ${res.isSuccess}!`,
              message: 'Create project success',
              type: 'success',
            });
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
  updateProject() {
    const valid = this.IsValidForm();
    if (valid) {
      const valueForm = this.createProjectForm.value;
      console.log(this.listEmployeeAll);
      const employees = this.employeeService.employeeDropdownToEmployee(
        this.getForm.member.value!,
        this.listEmployeeAll
      );
      console.log(employees);
      let projectUpdate = new Project();
      projectUpdate.id = parseInt(this.updateId);
      projectUpdate.groupId = Number(valueForm.groupId);
      projectUpdate.projectNumber = Number(valueForm.projectNumber);
      projectUpdate.name = String(valueForm.projectName);
      projectUpdate.customer = String(valueForm.customer);
      projectUpdate.status = String(valueForm.status);
      projectUpdate.employees = employees;
      if (valueForm.startDate != undefined) {
        projectUpdate.startDate = new Date(valueForm.startDate);
      }
      if (valueForm.endDate != undefined) {
        projectUpdate.endDate = new Date(valueForm.endDate);
      }
      console.log(projectUpdate);
      console.log(projectUpdate.employees);
      
      this.projectService.updateProject(projectUpdate).subscribe((res: ResponseDto) => {
        if (res.isSuccess) {
          this.route.navigate(['project-list']);
          this.toastService.toast({
            title: `Status: ${res.isSuccess}!`,
            message: 'Update project success',
            type: 'success',
          });
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
  checkExistProjectNumber(element: any) {
    if (element.value) {
      const projectNumber = Number.parseInt(element.value);
      this.projectService
        .checkProjectNumber(projectNumber)
        .subscribe((res: boolean) => {
          this.isExistProjectNumber = res;
        });
    } else {
      this.isExistProjectNumber = false;
    }
  }

  cancelCreate() {
    this.route.navigate(['project-list']);
  }
}
