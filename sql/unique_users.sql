--
-- Unique Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `uniq_sUserName` UNIQUE (`sUserName`);

ALTER TABLE `users`
  ADD CONSTRAINT `uniq_sEmail` UNIQUE (`sEmail`);
