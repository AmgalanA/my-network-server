import { profilePathTypes } from './path-types';

import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { ProfileService } from '../profile.service';

@WebSocketGateway(80, { namespace: 'profile', cors: true })
export class ProfileGateway {
  constructor(private profileService: ProfileService) {}

  @WebSocketServer()
  server: Server;

  profilesOnline: number[] = [];

  getProfilesOnline() {
    this.server.emit(profilePathTypes.GET_PROFILES_ONLINE, this.profilesOnline);
  }

  @SubscribeMessage(profilePathTypes.BECOME_ONLINE)
  becomeOnline(@MessageBody() id: number) {
    this.profilesOnline = [...new Set([...this.profilesOnline, id])];

    this.getProfilesOnline();
  }

  @SubscribeMessage(profilePathTypes.BECOME_OFFLINE)
  async becomeOffline(@MessageBody() id: number) {
    await this.profileService.updateLastSeen(id);

    this.profilesOnline = this.profilesOnline.filter(
      (profileId) => profileId !== id,
    );

    this.getProfilesOnline();
  }
}
