type RequestTokenResponse = {
    status: number;
    body: {
        userid: number;
        access_token: string;
        refresh_token: string;
        expires_in: number;
        scope: string;
        csrf_token: string;
        token_type: string;
    };
};

export { RequestTokenResponse };
