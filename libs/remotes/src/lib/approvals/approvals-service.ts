import { ApprovalStatus, IApproval } from '@cased/data';
import { axiosInstance } from '../axios';

/* eslint no-underscore-dangle: ["error", { "allow": ["metadata_"] }] */

export type ServerApproval = {
  id: string;
  created_at: string;
  prompt?: string;
  command?: string;
  ip_address: string;
  metadata_: {
    action: string;
    certificate_authentication: boolean;
    destination_server: string;
    destination_username: string;
    human_location: string;
    port: string;
  };
  requestor: {
    email: string;
  };
  responder?: {
    email: string;
  };
  status: string;
};

const transformServerApproval = (serverApproval: ServerApproval) => {
  // Make sure the server version of status is included in ApprovalStatus
  if (!Object.values<string>(ApprovalStatus).includes(serverApproval.status)) {
    throw new Error(`Unknown approval status "${serverApproval.status}"`);
  }

  const approval: IApproval = {
    id: String(serverApproval.id),
    createdAt: new Date(serverApproval.created_at),
    prompt: serverApproval.prompt,
    command: serverApproval.command,
    requestor: {
      email: serverApproval.requestor.email,
      avatarUrl: `https://i.pravatar.cc/150?u=${serverApproval.requestor.email}`,
    },
    responder: serverApproval.responder && {
      email: serverApproval.responder.email,
    },
    status: serverApproval.status as ApprovalStatus,
    ip: serverApproval.ip_address,
    action: serverApproval.metadata_.action,
    certificateAuthentication:
      serverApproval.metadata_.certificate_authentication,
    destinationServer: serverApproval.metadata_.destination_server,
    destinationUserName: serverApproval.metadata_.destination_username,
    humanLocation: serverApproval.metadata_.human_location,
    port: serverApproval.metadata_.port,
  };

  return approval;
};

export const approvalsService = {
  getAll: async () => {
    const { data } = await axiosInstance.get<{ approvals: ServerApproval[] }>(
      '/api/approvals',
    );
    return data.approvals.map(transformServerApproval);
  },

  get: async (id: string) => {
    const { data } = await axiosInstance.get<{ approval: ServerApproval }>(
      `/api/approvals/${id}`,
    );
    return transformServerApproval(data.approval);
  },

  update: async (approval: IApproval) => {
    const { data } = await axiosInstance.patch<{ approval: ServerApproval }>(
      `/api/approvals/${approval.id}`,
      {
        status: approval.status,
      },
    );

    return transformServerApproval(data.approval);
  },

  post: async (slug: string) => {
    const { data } = await axiosInstance.post<{ approvalRequestId: string }>(
      `/api/approvals`,
      { slug },
    );

    return data.approvalRequestId;
  },
};
