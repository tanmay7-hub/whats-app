export const formatTime =(date)=>{
   
   const diff =
      Math.floor(
         (Date.now() - new Date(date))
         / 60000
      );

   if(diff < 1)
      return "just now";

   if(diff < 60)
      return `${diff} min ago`;

   if(diff < 1440)
      return `${Math.floor(diff/60)} hr ago`;

   return `${Math.floor(diff/1440)} day ago`;
  }