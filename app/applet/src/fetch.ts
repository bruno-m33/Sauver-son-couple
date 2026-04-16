const fetchCourses = async () => {
  const res = await fetch('https://brunomarchal.podia.com/formations');
  const text = await res.text();
  const regex = /<h3[^>]*>(.*?)<\/h3>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    console.log(match[1].trim());
  }
};
fetchCourses();
