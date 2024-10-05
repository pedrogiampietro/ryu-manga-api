FROM node

# Definir o diretório de trabalho no container
WORKDIR /usr/app/

# Copiar o arquivo de dependências
COPY package.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Expor a porta que será utilizada pela aplicação
EXPOSE 3333

# Rodar as migrações e gerar o cliente Prisma
RUN npx prisma db push && npx prisma generate

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
