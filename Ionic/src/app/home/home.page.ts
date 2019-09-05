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
  public isRunning = false;
  public tasks: Task[] = [];
  public historyTasks: Task[] = [];
  public time;
  protected stopWatchInterval;
  protected buttonId: string;

  constructor(
      protected apiService: ApiService,
      protected activatedRoute: ActivatedRoute,
      @Inject(MomentService) public moment,
  ) {
    this.moment.locale('nl');
  }

  ngOnInit() {
    this.getTasks().then(() => {
      this.setTime();
    });
    this.getTasksEverySecond();
  }

  protected setTime() {
    if (!this.tasks[0].end_time) {
      // TODO: Afrond fout fixen
      const currentDateTime = this.moment();
      const startDateTime = this.moment(this.tasks[0].start_time);
      this.time = this.moment.duration(currentDateTime.diff(startDateTime)).asHours().toFixed(1);
      this.startOrStop();
    } else {
      this.time = this.moment().hour(0).minute(0).second(0).format('LTS');
    }
  }

  public startOrStop() {
    this.isStarted = !this.isStarted;

    if (this.isStarted && !this.isRunning) {
      this.start();
    }

    if (!this.isStarted && this.isRunning) {
      this.stop();
    }
  }

  protected start() {
    this.stopWatchInterval = setInterval(() => {
      this.isRunning = true;
      this.time = this.moment(this.time, 'LTS').add(1, 'seconds').format('LTS');
    }, 1000);
  }

  protected stop() {
    clearInterval(this.stopWatchInterval);
    this.isRunning = false;
    // TODO: Eindtijd opsturen naar API
  }

  public async getTasks() {
    this.buttonId = await this.activatedRoute.snapshot.paramMap.get('buttonId');

    let params = new HttpParams();
    params = params.append('id', this.buttonId);

    await this.apiService.get('tasks', {params}).then((tasks: Task[]) => {
      this.tasks = tasks.reverse();
      this.historyTasks = tasks.filter((task: Task) => {
        return task.end_time;
      });
    });
  }

  public getTasksEverySecond() {
    setInterval(() => {
      this.getTasks();
    }, 1000);
  }
}
