import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private player!: string;
  private turn!: number;
  private roll!: number;

  private oldParent!: string;
  private newParent!: string;
  private child!: string;
  private home: string | undefined;
  private eaten: string | undefined;

  constructor() {}

  public setAll(player: string, turn: number, roll: number): void {
    this.player = player;
    this.turn = turn;
    this.roll = roll;
  }

  public setOldParent(oldParent: string): void {
    this.oldParent = oldParent;
  }

  public setNewParent(newParent: string): void {
    this.newParent = newParent;
  }

  public setChild(child: string): void {
    this.child = child;
  }

  public setHome(home: string | undefined): void {
    this.home = home;
  }

  public setEaten(eaten: string | undefined): void {
    this.eaten = eaten;
  }

  public getPlayer(): string {
    return this.player;
  }

  public getTurn(): number {
    return this.turn;
  }

  public getRoll(): number {
    return this.roll;
  }

  public getOldParent(): string {
    return this.oldParent;
  }

  public getNewParent(): string {
    return this.newParent;
  }

  public getChild(): string {
    return this.child;
  }

  public getHome(): string | undefined {
    return this.home;
  }

  public getEaten(): string | undefined {
    return this.eaten;
  }
}
