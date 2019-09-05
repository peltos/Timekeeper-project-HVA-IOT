import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Task } from '../models/task';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MomentService } from '../providers/moment.service.provider';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public isStarted = false;
  public tasks: Task[] = [];
  protected buttonId: string;

  constructor(
      protected apiService: ApiService,
      protected activatedRoute: ActivatedRoute,
      @Inject(MomentService) public moment,
  ) {
  }

  ngOnInit() {
    this.getTasks();
  }

  public startOrStop() {
    console.log(this.isStarted);
    this.isStarted ? this.stop() : this.start();
    this.isStarted = !this.isStarted;
  }

  public start() {
    console.log('start');
  }

  public stop() {
    console.log('stop');
  }

  public async getTasks() {
    this.buttonId = await this.activatedRoute.snapshot.paramMap.get('buttonId');

    let params = new HttpParams();
    params = params.append('id', this.buttonId);

    await this.apiService.get('tasks', {params}).then((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }
}
