import { Schema, model } from 'mongoose';
import { BaseMessageOptions, ChannelType } from 'discord.js';

type CustomMessageOptions = Pick<BaseMessageOptions, 'content' | 'files' | 'embeds'>;

type LogCategoryOptions = {
  enable: boolean,
  channel: string | null
};

export interface IServerSettings {
  serverId: string;
  message: {
    join: { enable: boolean, channel: string | null, messageOptions: CustomMessageOptions };
    leave: { enable: boolean, channel: string | null, messageOptions: CustomMessageOptions };
    expansion: {
      enable: boolean;
      ignore: {
        types: ChannelType[];
        channels: string[];
      };
    };
  };
  report: {
    channel: string | null;
    mention: { enable: boolean; role: string | null };
  };
  log: {
    timeout: LogCategoryOptions;
    kick: LogCategoryOptions;
    ban: LogCategoryOptions;
    voice: LogCategoryOptions;
    delete: LogCategoryOptions;
  };
  changeVerificationLevel: {
    enable: boolean;
    log: { enable: boolean, channel: string | null };
    level: { old: number | null, new: number | null };
    time: { start: number | null, end: number | null };
  };
  autoPublic: { enable: boolean, channels: string[] };
  autoMod: {
    enable: boolean;
    log: { enable: boolean, channel: string | null };
    filter: {
      inviteUrl: boolean;
      token: boolean;
      shortUrl: boolean;
    };
    ignore: {
      channels: string[];
      roles: string[];
    };
  };
  afk: Map<string, string>;
  animeNews: {
    channelId: string | null;
    roleId: string | null;
  };
  invitationStats: {
    channelId: string | null;
    messageOptions: CustomMessageOptions;
    includeMembers: boolean;
    includeOnline: boolean;
    includeOffline: boolean;
    includeInvitations: boolean;
    includeInvitesWeekly: boolean;
    includeInvitesMonthly: boolean;
  };
}

const CustomMessageOptionsSchema = new Schema({
  content: String,
  files: [String],
  embeds: [Object],
}, { _id: false });

const LogCategoryOptionsSchema = new Schema({
  enable: { type: Boolean, default: false },
  channel: { type: String, default: null },
}, { _id: false });

const serverSettingsSchema = new Schema<IServerSettings>({
  serverId: { type: String, required: true, unique: true },
  message: {
    join: {
      enable: { type: Boolean, default: false },
      channel: { type: String, default: null },
      messageOptions: {
        type: CustomMessageOptionsSchema,
        default: {
          embeds: [{
            title: 'BIENVENUE',
            description: 'Bienvenue sur **![serverName]**, ![user] **(![userTag])** !',
            color: null,
            image: null,
          }],
        },
      },
    },
    leave: {
      enable: { type: Boolean, default: false },
      channel: { type: String, default: null },
      messageOptions: {
        type: CustomMessageOptionsSchema,
        default: { content: '**![userTag]** a quitté le serveur 👋' },
      },
    },
    expansion: {
      enable: { type: Boolean, default: false },
      ignore: {
        types: { type: [Number], default: [] },
        channels: { type: [String], default: [] },
      },
    },
  },
  report: {
    channel: { type: String, default: null },
    mention: {
      enable: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
  },
  log: {
    timeout: { type: LogCategoryOptionsSchema, default: { enable: false, channel: null } },
    kick: { type: LogCategoryOptionsSchema, default: { enable: false, channel: null } },
    ban: { type: LogCategoryOptionsSchema, default: { enable: false, channel: null } },
    voice: { type: LogCategoryOptionsSchema, default: { enable: false, channel: null } },
    delete: { type: LogCategoryOptionsSchema, default: { enable: false, channel: null } },
  },
  changeVerificationLevel: {
    enable: { type: Boolean, default: false },
    log: {
      enable: { type: Boolean, default: false },
      channel: { type: String, default: null },
    },
    level: {
      old: { type: Number, default: null },
      new: { type: Number, default: null },
    },
    time: {
      start: { type: Number, default: null },
      end: { type: Number, default: null },
    },
  },
  autoPublic: {
    enable: { type: Boolean, default: false },
    channels: { type: [String], default: [] },
  },
  autoMod: {
    enable: { type: Boolean, default: false },
    log: {
      enable: { type: Boolean, default: false },
      channel: { type: String, default: null },
    },
    filter: {
      inviteUrl: { type: Boolean, default: false },
      token: { type: Boolean, default: false },
      shortUrl: { type: Boolean, default: false },
    },
    ignore: {
      channels: { type: [String], default: [] },
      roles: { type: [String], default: [] },
    },
  },
  afk: {
    type: Map,
    of: String,
    default: new Map(),
  },
  animeNews: {
    channelId: { type: String, default: null },
    roleId: { type: String, default: null },
  },
  invitationStats: {
    channelId: { type: String, default: null },
    messageOptions: {
      type: CustomMessageOptionsSchema,
      default: {
        content: 'Voici les statistiques de l\'invitation :',
        embeds: [],
      },
    },
    includeMembers: { type: Boolean, default: true },
    includeOnline: { type: Boolean, default: true },
    includeOffline: { type: Boolean, default: true },
    includeInvitations: { type: Boolean, default: true },
    includeInvitesWeekly: { type: Boolean, default: true },
    includeInvitesMonthly: { type: Boolean, default: true },
  },
});

export default model<IServerSettings>('ServerSettings', serverSettingsSchema);