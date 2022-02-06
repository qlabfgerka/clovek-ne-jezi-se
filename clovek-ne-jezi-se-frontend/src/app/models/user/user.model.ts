export class UserDTO {
  id?: string | undefined | null = null;
  username: string | undefined | null = null;
  nickname: string | undefined | null = null;
  email: string | undefined | null = null;
  password?: string | undefined | null = null;
  gamesPlayed: number | undefined | null = null;
  results: Array<number> | undefined | null = null;
}

export class PlayerDTO {
  id?: string | undefined | null = null;
  player: UserDTO | undefined | null = null;
  finished: boolean | undefined | null = null;
  pieces: number | undefined | null = null;
}
