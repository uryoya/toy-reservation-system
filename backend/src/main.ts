import { description as iamDescription } from "#mod/iam";
import { description as profileDescription } from "#mod/profile";
import { description as reservationDescription } from "#mod/reservation";

const main = () => {
  console.log("module iam:", iamDescription);
  console.log("module profile:", profileDescription);
  console.log("module reservation:", reservationDescription);
};

main();
