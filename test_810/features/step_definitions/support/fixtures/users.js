import nuxeo from '../services/client';

global.users = {
  Administrator: 'Administrator',
};

module.exports = function () {
  this.After(() => {
    const userWorkspaces = '/default-domain/UserWorkspaces/';
    return nuxeo.repository().delete(userWorkspaces)
      .catch(() => {}); // eslint-disable-line arrow-body-style
  });
};
