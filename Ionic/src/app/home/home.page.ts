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

  public isTiming = false;
  public tasks: Task[] = [];
  public time: string;
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
    setInterval(() => {
      this.getTasks().then(() => {
        this.setTime();
      });
    }, 1000);
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
    if (this.tasks[0].end_time && this.isTiming) {
      this.time = this.moment().hour(0).minute(0).second(0).format('LTS');
      this.stopTimer();
    }

    if (this.tasks[0].end_time && !this.isTiming) {
      this.time = this.moment().hour(0).minute(0).second(0).format('LTS');
      this.stopTimer();
    }

    if (!this.tasks[0].end_time && !this.isTiming) {
      this.time = this.calculateTime();
      this.startTimer();
    }
  }

  protected calculateTime() {
    const currentDateTime = this.moment();
    const startDateTime = this.moment(this.tasks[0].start_time);
    return this.moment.duration(currentDateTime.diff(startDateTime)).asHours().toFixed(1);
  }

  protected startTimer() {
    this.isTiming = true;
    document.getElementById('hero').className = 'hero active';
    this.stopWatchInterval = setInterval(() => {
      this.time = this.moment(this.time, 'LTS').add(1, 'seconds').format('LTS');
    }, 1000);
  }

  protected stopTimer() {
    this.isTiming = false;
    clearInterval(this.stopWatchInterval);
    document.getElementById('hero').className = 'hero standby';
  }
}
