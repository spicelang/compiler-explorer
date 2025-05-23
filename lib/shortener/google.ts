// Copyright (c) 2017, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

// This will stop working in August 2025.
// https://developers.googleblog.com/en/google-url-shortener-links-will-no-longer-be-available/
export class ShortLinkResolver {
    resolve(url: string) {
        return new Promise<{longUrl: string}>((resolve, reject) => {
            const settings: RequestInit = {
                method: 'HEAD',
                redirect: 'manual',
            };

            fetch(url + '?si=1', settings)
                .then((res: Response) => {
                    if (res.status !== 302) {
                        reject(`Got response ${res.status}`);
                        return;
                    }
                    const targetLocation = res.headers.get('Location');
                    if (!targetLocation) {
                        reject(`Missing location url in ${targetLocation}`);
                        return;
                    }
                    resolve({
                        longUrl: targetLocation,
                    });
                })
                .catch(err => reject(err.message));
        });
    }
}
