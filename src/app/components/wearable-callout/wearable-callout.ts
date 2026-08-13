import { Component } from '@angular/core';

const REPO_URL = 'https://github.com/vingirc/dashboard-biometrico-wearable';

@Component({
  selector: 'app-wearable-callout',
  standalone: true,
  templateUrl: './wearable-callout.html',
})
export class WearableCallout {
  readonly repoUrl = REPO_URL;
  readonly qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(REPO_URL)}`;
}
