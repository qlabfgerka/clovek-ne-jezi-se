import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @Output() moveEvent = new EventEmitter<void>();

  constructor(private readonly dataService: DataService) {}

  ngOnInit(): void {}

  public update(child: string, oldParent: string, newParent: string): void {
    const childDiv = document.getElementsByClassName(child)[0];
    const oldParentDiv = document.getElementsByClassName(oldParent)[0];
    const newParentDiv = document.getElementsByClassName(newParent)[0];

    oldParentDiv.removeChild(childDiv);
    newParentDiv.appendChild(childDiv);
  }

  public move(event: any): void {
    let div: Element;
    const child = event.target;
    const parent = event.target.parentNode;
    const parentClasses: Array<string> =
      event.target.parentNode.className.split(' ');
    const childClasses: Array<string> = event.target.className.split(' ');

    const turn: number = this.dataService.getTurn();
    const roll: number = this.dataService.getRoll();
    const player: string = this.dataService.getPlayer();

    if (+player[1] - 1 !== turn || !childClasses.includes(player)) return;

    this.dataService.setChild(event.target.className);
    this.dataService.setOldParent(event.target.parentNode.className);

    parent.removeChild(child);

    if (
      parentClasses.includes('s1') ||
      parentClasses.includes('s2') ||
      parentClasses.includes('s3') ||
      parentClasses.includes('s4')
    ) {
      if (roll !== 6) {
        parent.appendChild(child);
        return;
      }
      div = document.getElementsByClassName(
        `tile board ${this.getStartPosition(parentClasses[2])}`
      )[0];
      this.dataService.setNewParent(
        `tile board ${this.getStartPosition(parentClasses[2])}`
      );
      div.appendChild(child);
    } else if (
      parentClasses.includes(`${childClasses[1]}w1`) ||
      parentClasses.includes(`${childClasses[1]}w2`) ||
      parentClasses.includes(`${childClasses[1]}w3`) ||
      parentClasses.includes(`${childClasses[1]}w4`)
    ) {
      if (this.moveHome(childClasses[1], +parentClasses[2][3], 1) === '')
        return;
      div = document.getElementsByClassName(
        `tile board ${this.moveHome(
          childClasses[1],
          +parentClasses[2][3],
          roll
        )}`
      )[0];
      this.dataService.setNewParent(
        `tile board ${this.moveHome(
          childClasses[1],
          +parentClasses[2][3],
          roll
        )}`
      );
      div.appendChild(child);
    } else {
      div = document.getElementsByClassName(
        `tile board ${this.checkHome(childClasses[1], +parentClasses[2], roll)}`
      )[0];
      this.dataService.setNewParent(
        `tile board ${this.checkHome(childClasses[1], +parentClasses[2], roll)}`
      );
      if (div.children.length > 0) this.reset(childClasses[1], div.children);
      div.appendChild(child);
    }

    this.moveEvent.emit();
  }

  private getStartPosition(player: string): number {
    if (player === 'p1') return 24;
    else if (player === 'p2') return 4;
    else if (player === 'p3') return 34;
    else return 14;
  }

  private checkHome(player: string, position: number, roll: number): string {
    const next: number = position + roll;
    if (player === 'p1' && next > 22 && position <= 22)
      return `${player}w${next % 22}`;
    else if (player === 'p2' && next > 2 && position <= 2)
      return `${player}w${(40 + next) % 42}`;
    else if (player === 'p2' && next > 2 && next > 40 && position >= 37)
      return `${player}w${next % 42}`;
    else if (player === 'p3' && next > 32 && position <= 32)
      return `${player}w${next % 32}`;
    else if (player === 'p4' && next > 12 && position <= 12)
      return `${player}w${next % 12}`;
    return `${next % 40}`;
  }

  private moveHome(player: string, position: number, roll: number): string {
    if (position + roll === 5) return '';
    else if (position + roll < 5) return `${player}w${position + roll}`;
    return `${player}w${position}`;
  }

  private reset(player: string, children: HTMLCollection): void {
    const child = children.length === 2 ? children[1] : children[0];
    const childClasses: Array<string> = child.className.split(' ');

    if (childClasses.includes('circle') || childClasses.includes(player))
      return;

    child.parentNode!.removeChild(child);
    this.sendHome(childClasses[1], child);
  }

  private sendHome(player: string, child: Element): void {
    const divs = document.getElementsByClassName(`tile board ${player}`);

    for (const div of Array.from(divs)) {
      console.log(div.children.length);
      if (div.children.length === 0) {
        div.appendChild(child);
        return;
      }
    }
  }
}
