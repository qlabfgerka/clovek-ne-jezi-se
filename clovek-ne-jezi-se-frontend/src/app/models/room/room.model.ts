import { PlayerDTO, UserDTO } from '../user/user.model';

export class RoomDTO {
  id?: string | undefined | null = null;
  title: string | undefined | null = null;
  admin?: UserDTO | undefined | null = null;
  password?: string | undefined | null = null;
  playerList?: Array<PlayerDTO> | undefined | null = null;
  turn?: number | undefined | null = null;
}
