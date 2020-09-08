// eslint-disable-next-line
const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

const validUrl = (url) => urlRegex.test(url);
const validTitle = (title) => title.length > 0 && title.length <= 50;
const validDescription = (description) =>
  description.length > 0 && description.length <= 500;
const validTezosAddress = (address) => address.length === 36;

export const projectEntryValidations = {
  image: validUrl,
  title: validTitle,
  description: validDescription,
  website: validUrl,
  twitter: validUrl,
  github: validUrl,
  category: validTitle,
  address: validTezosAddress,
};

export const proposalVaidations = {
  description: validDescription,
};

export const disputeValidations = {
  reason: validTitle,
  description: validDescription,
};
