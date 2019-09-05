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
  public time: string;
  protected stopWatchInterval;
  protected buttonId: string;

  protected static makeHash() {
    return Math.random().toString(36).substr(2, 5);
  }

  constructor(
      protected apiService: ApiService,
      protected activatedRoute: ActivatedRoute,
      @Inject(MomentService) public moment,
  ) {
    this.moment.locale('nl');
  }

  ngOnInit() {
    setInterval(() => {
      this.getTasks().then(() => {
        this.setTime();
      });
    }, 1000);
  }

  public changeState() {
    this.isStarted = !this.isStarted;

    if (this.isStarted && !this.isRunning) {
      this.start();
    }

    if (!this.isStarted && this.isRunning) {
      this.stop();
    }
  }

  protected async getTasks() {
    this.buttonId = await this.activatedRoute.snapshot.paramMap.get('buttonId');

    let params = new HttpParams();
    params = params.append('id', this.buttonId);

    await this.apiService.get('tasks', {params}).then((tasks: Task[]) => {
      this.tasks = tasks.reverse();
    });
  }

  protected setTime() {
    if (this.tasks[0].end_time && !this.isRunning) {
      this.time = this.moment().hour(0).minute(0).second(0).format('LTS');
    }

    if (!this.tasks[0].end_time && !this.isRunning) {
      this.time = this.calculateTime();
    }
  }

  protected calculateTime() {
    const currentDateTime = this.moment();
    const startDateTime = this.moment(this.tasks[0].start_time);
    return this.moment.duration(currentDateTime.diff(startDateTime)).asHours().toFixed(1);
  }


  protected start() {
    if (this.tasks[0].end_time) {
      this.startTaskOnServer();
    }

    this.startTimer();
    document.getElementById('hero').className = 'hero active';
  }

  protected stop() {
    if (!this.tasks[0].end_time) {
      this.stopTaskOnServer();
    }

    this.stopTimer();
    document.getElementById('hero').className = 'hero standby';
  }

  protected startTaskOnServer() {
    let params = new HttpParams();
    params = params.append('id', this.buttonId);
    params = params.append('hash', HomePage.makeHash());
    params = params.append('tap', 'start');

    this.apiService.get('add-task', {params});
  }

  protected stopTaskOnServer() {
    let params = new HttpParams();
    params = params.append('id', this.buttonId);
    params = params.append('hash', this.tasks[0].hash);
    params = params.append('tap', 'end');

    this.apiService.get('add-task', {params});
  }

  protected startTimer() {
    this.stopWatchInterval = setInterval(() => {
      this.isRunning = true;
      this.time = this.moment(this.time, 'LTS').add(1, 'seconds').format('LTS');
    }, 1000);
  }

  protected stopTimer() {
    this.isRunning = false;
    clearInterval(this.stopWatchInterval);
  }
}
