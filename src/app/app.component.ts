import { AfterViewInit } from '@angular/core';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes, query, animateChild, group } from '@angular/animations';

const debug = false;

const CLOUD_LIFE = debug ? 9999999 : 120;
const CLOUD_COLOR = 'white';
const CLOUD_RAINING_COLOR = 'gray';
const CLOUD_CONTAINER_WIDTH = debug ? 500 : 6000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    // '(@cloudMove.done)': 'captureDoneEvent($event)',
  },
  animations: [
    trigger('cloudMove', [
      transition('* => *', animate(`${CLOUD_LIFE}s linear`, keyframes([
        style({ right: '*' }),
        style({ right: `${CLOUD_CONTAINER_WIDTH}px` }),
      ])))
    ]),
    trigger('cloudDarken', [
      state('false', style({
        background: CLOUD_COLOR
      })),
      state('true', style({
        background: CLOUD_RAINING_COLOR
      })),
      transition('false => true',
        animate('500ms 100ms')
      ),
    ]),
    trigger('raining', [
      state('false', style({
        opacity: 0
      })),
      state('true', style({
        opacity: .8
      })),
      transition('false => true',
        animate('500ms 100ms')
      ),
    ])
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  cloudState = 'false';
  title = 'clouds';

  @ViewChild("sky")
  sky: ElementRef;

  cloudMap: Map<number, Cloud> = new Map();
  cloudHoverMap: Map<Cloud, Map<number, boolean>> = new Map();

  increment = 0;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (debug) {
      this.spawnCloud();
      console.log(this.cloudHoverMap)
      return;
    }
    this.spawnStarterClouds();
    this.setCloudInterval(0);
  }

  spawnStarterClouds() {
    let right = 0;
    let cloudAmount = 20;
    let distance = CLOUD_CONTAINER_WIDTH / cloudAmount;
    for (let i = 0; i < cloudAmount; i++) {
      let cloud = this.spawnCloud();
      let rightDiff = randomNumber(100, 0) - 50;
      cloud.startMargin = rightDiff + right;
      // cloudElem.style.marginRight = `${right + rightDiff}px`;
      right += distance;

      // this.createDeleteCloudInterval(cloud);
    }
  }

  setCloudInterval(time) {
    let minTimeTilNextCloud = 2000;
    let maxTimeTilNextCloud = 6000;
    
    let interval = window.setInterval(() => {
      this.spawnCloud();
      // this.createDeleteCloudInterval(cloudElem);
      time = randomNumber(minTimeTilNextCloud, maxTimeTilNextCloud);
      clearInterval(interval);
      this.setCloudInterval(time);
    }, time);
  }

  createDeleteCloudInterval(cloudElem) {
    let cloudLife = CLOUD_LIFE - 10;
    let interval = window.setInterval(() => {
      cloudElem.remove();
      clearInterval(interval);
    }, cloudLife);
  }


  spawnCloud() {
    let maxSkyHeight = 70;
    let minSkyHeight = 0;
    let skyCloudHeight = randomNumber(minSkyHeight, maxSkyHeight);
    let yPos = skyCloudHeight;

    let cloud: Cloud = {
      id: this.increment++,
      yPosition: debug ? 40 : yPos,
      raining: false,
      startMargin: 0,
      lightning: false
    }

    console.log('Created Cloud:', cloud);

    this.cloudMap.set(cloud.id, cloud);

    let hoveringMap: Map<number, boolean> = new Map();
    hoveringMap.set(0, false);
    hoveringMap.set(1, false);
    hoveringMap.set(2, false);
    hoveringMap.set(3, false);
    hoveringMap.set(4, false);
    hoveringMap.set(5, false);

    this.cloudHoverMap.set(cloud, hoveringMap);

    this.cd.detectChanges();

    return cloud;
  }

  toggleRain(cloud: Cloud, on: boolean, cloudPartIndex: number) {
    let cloudPartHoverMap = this.cloudHoverMap.get(cloud);
    cloudPartHoverMap.set(cloudPartIndex, on);

    let hovering = false;
    for (let hover of cloudPartHoverMap.values()) {
      if (hover) {
        hovering = true;
        break
      }
    }

    cloud.raining = hovering;
  }

  captureDoneEvent(event: any) {
    let elem = event.element;
    let cloud = this.cloudMap.get(+elem.id);

    this.cloudMap.delete(+elem.id);
  }

  identify(index, item) {
    return item.key;
  }

  
  lightning(cloud: Cloud) {
    cloud.lightning = true;
    setTimeout(() => {
      cloud.lightning = false;
    }, 50);
  }

  debug() {
    console.log(this)
  }
  
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface Cloud {
  id: number;
  yPosition: number;
  raining: boolean;
  startMargin?: number;
  lightning: boolean;
}