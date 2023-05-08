<script>
  export let mode

  const toggleMode = newMode => (mode = newMode)
</script>

<div class="mode-control-group">
  <div class="mode-control mode-control-quadrant" on:click={() => toggleMode('quadrant')} aria-label="Quadrant" tabindex="0" class:active={mode === 'quadrant'}>
    <span class="tooltip">Quadrant</span>
  </div>
  <div class="mode-control mode-control-whole" on:click={() => toggleMode('whole')} aria-label="Whole Image" tabindex="0" class:active={mode === 'whole'}>
    <span class="tooltip">Whole Image</span>
  </div>
  <div class="mode-control mode-control-crop" on:click={() => toggleMode('crop')} aria-label="Whole Image" tabindex="0" class:active={mode === 'whole'}>
    <span class="tooltip">Crop Image</span>
  </div>
</div>

<style>
  .mode-control:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  .mode-control-quadrant {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3QgeD0iMzYuMjc4IiB5PSIxMC4zNzgiIHdpZHRoPSIxNy4zNDMiIGhlaWdodD0iMTcuMzQzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNS45IDY0KSByb3RhdGUoLTkwKSIgc3R5bGU9ImZpbGw6I2ZmZjsiLz48cmVjdCB4PSIxMC4zNzgiIHk9IjEwLjM3OCIgd2lkdGg9IjE3LjM0MyIgaGVpZ2h0PSIxNy4zNDMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM4LjEgMzguMSkgcm90YXRlKC0xODApIiBzdHlsZT0iZmlsbDojZmZmOyIvPjxyZWN0IHg9IjEwLjM3OCIgeT0iMzYuMjc4IiB3aWR0aD0iMTcuMzQzIiBoZWlnaHQ9IjE3LjM0MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjQgMjUuOSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6I2ZmZjsiLz48cmVjdCB4PSIzNi4yNzgiIHk9IjM2LjI3OCIgd2lkdGg9IjE3LjM0MyIgaGVpZ2h0PSIxNy4zNDMiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjwvc3ZnPg==');
  }
  .mode-control-whole {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxyZWN0IHg9IjEwLjM4IiB5PSIxMC4zOCIgd2lkdGg9IjQzLjI0IiBoZWlnaHQ9IjQzLjI0IiBzdHlsZT0iZmlsbDojZmZmOyIvPjwvc3ZnPg==');
  }
  .mode-control-crop {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxwb2x5bGluZSBwb2ludHM9IjI4LjAzMSAxNC44MjEgNDkuMTc5IDE0LjgyMSA0OS4xNzkgNTkuMzkiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NnB4OyIvPjxsaW5lIHgxPSI0LjYxIiB5MT0iMTQuODIxIiB4Mj0iMTQuODIxIiB5Mj0iMTQuODIxIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjZweDsiLz48bGluZSB4MT0iNDkuMTc5IiB5MT0iNDkuMTc5IiB4Mj0iNTkuMzkiIHkyPSI0OS4xNzkiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NnB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjM1Ljk2OSA0OS4xNzkgMTQuODIxIDQ5LjE3OSAxNC44MjEgNC42MSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo2cHg7Ii8+PC9zdmc+');
  }
  .mode-control-group {
    display: flex;
    position: relative;
    width: calc(var(--buttonsize) * 3);
  }
  .mode-control-quadrant,
  .mode-control-whole,
  .mode-control-crop {
    width: var(--buttonsize);
    height: var(--buttonsize);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    position: relative;
    margin: 0 5px;
    transition: all 0.3s;
    opacity: 0.4;
    display: block;
  }
  .mode-control-quadrant:hover,
  .mode-control-whole:hover {
    opacity: 1;
  }
  .active {
    opacity: 1;
    border: 1px;
    background-color: (255, 255, 255, 0.4);
  }
</style>
