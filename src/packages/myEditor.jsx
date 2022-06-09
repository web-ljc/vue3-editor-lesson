import { defineComponent } from "vue";

export default defineComponent({
  props: {
    data: {type: Object}
  },
  setup(props) {
    console.log(props.data);
    return () => <div>edit</div>
  }
})